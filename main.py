from web import create_app


app = create_app()

if __name__ == "__main__":
    #Set to 'True' to re-run server on edit
    app.run(debug=True)
