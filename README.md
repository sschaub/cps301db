# cps301db

This application presents a simple web interface to a MySQL database. It is used in
CpS 301.

# setup procedure

1. Create a server in (ex.) DigitalOcean
2. Execute steps in install.sh
3. Clone this repository to /home/user
4. Execute: `docker compose run app1 npm install `
5. Execute: `docker compose up -d`
6. Verify you can access the application via a web browser at http://ip-of-server
7. Execute: `docker compose down -v`
8. Set a password for the database and start it running:

```
MYSQL_ROOT_PASSWORD=your-root-password
MYSQL_PASSWORD=mysql-user-password
docker compose up -d
```
