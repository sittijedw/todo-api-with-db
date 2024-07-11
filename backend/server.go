package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

type Todo struct {
	ID     int            `json:"id"`
	Title  sql.NullString `json:"title"`
	Status sql.NullString `json:"status"`
}

func main() {
	ctx, cancle := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancle()

	r := gin.Default()
	r.GET("/api/v1/todos", getTodosHandler)

	srv := http.Server{
		Addr:    ":" + os.Getenv("PORT"),
		Handler: r,
	}

	closedChan := make(chan struct{})

	go func() {
		<-ctx.Done()
		log.Println("shutting down...")

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			if !errors.Is(err, http.ErrServerClosed) {
				log.Println(err)
			}
		}
		close(closedChan)
	}()

	if err := srv.ListenAndServe(); err != nil {
		log.Println(err)
	}

	<-closedChan
}

func connectDB() *sql.DB {
	url := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", url)

	if err != nil {
		log.Fatal("Connect to database error", err)
	}

	return db
}

func getTodosHandler(ctx *gin.Context) {
	db := connectDB()
	defer db.Close()

	rows, err := db.Query("SELECT id, title, status FROM todos")

	if err != nil {
		log.Fatal("can't query all todos", err)
	}

	var todos []Todo
	for rows.Next() {
		var todo Todo

		err := rows.Scan(&todo.ID, &todo.Title, &todo.Status)
		if err != nil {
			log.Fatal("Can't scan row into todo struct", err)
		}

		todos = append(todos, todo)
	}

	ctx.JSON(http.StatusOK, todos)
	log.Println("Get all todos success!!!")
}
