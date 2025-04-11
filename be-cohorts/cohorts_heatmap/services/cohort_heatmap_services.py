import mysql.connector
from django.conf import settings

def get_cohorts_data(start_date, end_date, quincena):
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
                c.fecha_inicial,
                c.fecha_final,
                cq.quincena,
                cq.fecha,
                cq.porcentaje_activas,
                cq.cantidad_activas
            FROM 
                cohorts_quincenal cq
            JOIN 
                cohorts c ON cq.id_cohorte = c.id
            WHERE 1 = 1
        """
        params = []

        if start_date:
            query += " AND cq.fecha >= %s"
            params.append(start_date)

        if end_date:
            query += " AND cq.fecha <= %s"
            params.append(end_date)

        if quincena:
            query += " AND cq.quincena = %s"
            params.append(quincena)

        cursor.execute(query, tuple(params))
        result = cursor.fetchall()

        cursor.close()
        connection.close()
        return result
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        raise
