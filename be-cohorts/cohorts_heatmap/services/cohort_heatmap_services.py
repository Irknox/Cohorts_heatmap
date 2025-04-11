import mysql.connector
from django.conf import settings

def get_cohorts_data():
    try:
        connection = mysql.connector.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME
        )

        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT 
            c.nombre AS nombre_cohorte,
            cq.quincena,
            cq.porcentaje_activas,
            cq.cantidad_activas
            FROM 
            cohorts_quincenal cq
            JOIN 
            cohorts c ON cq.id_cohorte = c.id;
            """
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()
        connection.close()

        return result
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        raise