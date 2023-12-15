const { sqlForPartialUpdate } = require('./sql')


describe ("sqlForPartialUpdate", function () {
    test("works", function () {
        const data = {
            "username": "admin",
	        "password": "password",
	        "firstName": "test",
	        "lastName": "test",
	        "email": "admin@admin.com"
        }
        const jsToSql = {
            "username": "user",
	        "password": "password",
	        "firstName": "User",
	        "lastName": "test",
	        "email": "admin@admin.com"
        }
        const { setCols, values } = sqlForPartialUpdate(data, jsToSql)
        expect(setCols).toBe('"user"=$1, "password"=$2, "User"=$3, "test"=$4, "admin@admin.com"=$5')
        expect(values).toEqual(["admin", "password", "test", "test", "admin@admin.com"]);

    })
})