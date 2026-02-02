package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
)

func main() {
	var (
		apiKey  = flag.String("apikey", "env-service-a-1/service-a", "API key (sent as X-Api-Key header if provided)")
		send    = flag.String("send", "", "Optional: JSON string to send immediately after connect")
		pingSec = flag.Int("ping", 20, "Ping interval in seconds (0 to disable)")
	)
	flag.Parse()

	headers := http.Header{}
	if *apiKey != "" {
		// If your relay-proxy uses a different header (e.g. Authorization),
		// change this line accordingly.
		headers.Set("X-Api-Key", *apiKey)
		headers.Set("Authorization", fmt.Sprintf("Bearer %s", *apiKey))
	}

	u := url.URL{
		Scheme: "ws",
		Host:   "localhost:1031",
		Path:   "/ws/v1/flag/change",
	}
	q := u.Query()
	q.Set("apiKey", *apiKey)
	u.RawQuery = q.Encode()

	log.Printf("connecting to %s", u.String())

	conn, resp, err := websocket.DefaultDialer.Dial(u.String(), headers)
	if err != nil {
		if resp != nil {
			log.Fatalf("dial failed: %v (HTTP %s)", err, resp.Status)
		}
		log.Fatalf("dial failed: %v", err)
	}
	defer conn.Close()

	log.Printf("connected: %s", u.String())

	// If the endpoint expects an initial payload, you can pass it with -send.
	// Example:
	//   -send '{"flags":["my-flag","another-flag"]}'
	if strings.TrimSpace(*send) != "" {
		if err := conn.WriteMessage(websocket.TextMessage, []byte(*send)); err != nil {
			log.Fatalf("failed to send initial message: %v", err)
		}
		log.Printf("sent init payload: %s", *send)
	}

	// Graceful shutdown on Ctrl+C.
	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			mt, msg, err := conn.ReadMessage()
			if err != nil {
				log.Printf("read error: %v", err)
				return
			}
			switch mt {
			case websocket.TextMessage:
				fmt.Printf("[text] %s\n", msg)
			case websocket.BinaryMessage:
				fmt.Printf("[binary] %d bytes\n", len(msg))
			default:
				fmt.Printf("[type=%d] %d bytes\n", mt, len(msg))
			}
		}
	}()

	// Optional keepalive pings.
	var ticker *time.Ticker
	if *pingSec > 0 {
		ticker = time.NewTicker(time.Duration(*pingSec) * time.Second)
		defer ticker.Stop()
	}

	sigc := make(chan os.Signal, 1)
	signal.Notify(sigc, os.Interrupt, syscall.SIGTERM)

	for {
		select {
		case <-done:
			return
		case <-sigc:
			_ = conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "bye"))
			return
		case <-func() <-chan time.Time {
			if ticker == nil {
				return make(chan time.Time)
			}
			return ticker.C
		}():
			_ = conn.WriteControl(websocket.PingMessage, []byte("ping"), time.Now().Add(5*time.Second))
		}
	}
}
