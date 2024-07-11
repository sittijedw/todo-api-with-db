package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

type Todo struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Status string `json:"status"`
}

var DB *sql.DB

func main() {
	ctx, cancle := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancle()

	DB = connectDB()
	defer DB.Close()

	r := gin.Default()
	r.GET("/api/v1/todos", getTodosHandler)
	r.GET("/api/v1/todos/:id", getTodoByIDHandler)
	r.POST("/api/v1/todos", postTodoHandler)
	r.PUT("/api/v1/todos/:id", putTodoByIDHandler)
	r.DELETE("/api/v1/todos/:id", deleteTodoByIDHandler)
	r.PATCH("/api/v1/todos/:id/actions/title", patchTodoTitleByIDHandler)
	r.PATCH("/api/v1/todos/:id/actions/status", patchTodoStatusByIDHandler)

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
		log.Println("Connect to database error", err)
	}

	return db
}

func getTodosHandler(ctx *gin.Context) {
	rows, err := DB.Query("SELECT id, title, status FROM todos")

	if err != nil {
		log.Println("Can't query all todos", err)
	}

	var todos []Todo
	for rows.Next() {
		var todo Todo

		err := rows.Scan(&todo.ID, &todo.Title, &todo.Status)
		if err != nil {
			log.Println("Can't scan row into todo struct", err)
		}

		todos = append(todos, todo)
	}

	ctx.JSON(http.StatusOK, todos)
	log.Println("Get all todos success!!!")
}

func getTodoByIDHandler(ctx *gin.Context) {
	paramID := ctx.Param("id")
	row := DB.QueryRow("SELECT id, title, status FROM todos WHERE id=$1", paramID)

	var todo Todo
	err := row.Scan(&todo.ID, &todo.Title, &todo.Status)

	if err != nil {
		log.Println("Can't scan row into todo struct", err)
	}

	ctx.JSON(http.StatusOK, todo)
}

func postTodoHandler(ctx *gin.Context) {
	var todo Todo

	if err := ctx.BindJSON(&todo); err != nil {
		ctx.Error(err)
	}

	row := DB.QueryRow("INSERT INTO todos (title, status) VALUES ($1, $2) RETURNING id", todo.Title, todo.Status)

	var id int
	err := row.Scan(&id)

	if err != nil {
		log.Println("Can't scan id", err)
		return
	}

	todo.ID = id

	log.Println("Insert todo success")
	ctx.JSON(http.StatusOK, todo)
}

func putTodoByIDHandler(ctx *gin.Context) {
	var todo Todo

	err := ctx.BindJSON(&todo)

	if err != nil {
		ctx.Error(err)
	}

	todo.ID, err = strconv.Atoi(ctx.Param("id"))

	if err != nil {
		log.Println("Can't convert string to int", err)
	}

	_, err = DB.Exec("UPDATE todos SET title=$1, status=$2 WHERE id=$3", todo.Title, todo.Status, todo.ID)

	if err != nil {
		log.Println("Can't update todo", err)
	}

	log.Println("Update todo success")
	ctx.JSON(http.StatusOK, todo)
}

func patchTodoTitleByIDHandler(ctx *gin.Context) {
	var todo Todo

	err := ctx.BindJSON(&todo)

	if err != nil {
		ctx.Error(err)
	}

	todo.ID, err = strconv.Atoi(ctx.Param("id"))

	if err != nil {
		log.Println("Can't convert string to int", err)
	}

	_, err = DB.Exec("UPDATE todos SET title=$1 WHERE id=$2", todo.Title, todo.ID)

	if err != nil {
		log.Println("Can't update todo title", err)
	}

	log.Println("Update todo title success")
	ctx.Status(http.StatusOK)
}

func patchTodoStatusByIDHandler(ctx *gin.Context) {
	var todo Todo

	err := ctx.BindJSON(&todo)

	if err != nil {
		ctx.Error(err)
	}

	todo.ID, err = strconv.Atoi(ctx.Param("id"))

	if err != nil {
		log.Println("Can't convert string to int", err)
	}

	_, err = DB.Exec("UPDATE todos SET status=$1 WHERE id=$2", todo.Status, todo.ID)

	if err != nil {
		log.Println("Can't update todo status", err)
	}

	log.Println("Update todo status success")
	ctx.Status(http.StatusOK)
}

func deleteTodoByIDHandler(ctx *gin.Context) {
	paramID := ctx.Param("id")

	_, err := DB.Exec("DELETE FROM todos WHERE id=$1", paramID)

	if err != nil {
		log.Println("Can't delete todo", err)
	}

	log.Println("Delete todo success")
	ctx.JSON(http.StatusOK, "Success")
}
