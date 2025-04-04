# Reto Técnico Rimac Backend 2024

## 🩺 Aplicación de agendamiento de cita médica para asegurados

Este proyecto implementa una solución backend serverless para agendar citas médicas para asegurados en Perú y Chile, usando AWS y buenas prácticas de arquitectura de software.

---

## 📚 Descripción Técnica

La aplicación permite a un asegurado:
- Agendar una cita médica (estado inicial: `pending`).
- Consultar sus citas registradas.
- Procesar las citas dependiendo del país (`PE` o `CL`).
- Confirmar el agendamiento finalizando el estado como `completed`.

---

## 🏛️ Arquitectura

El flujo general de la aplicación es:

1. **POST** solicitud de cita → Lambda `appointment` guarda en DynamoDB (`pending`).
2. **Lambda `appointment`** envía el evento a **SNS**.
3. **SNS** enruta el evento a **SQS_PE** o **SQS_CL** según el país (`countryISO`).
4. **Lambdas `appointment_pe` o `appointment_cl`** leen su respectivo SQS y almacenan en una base de datos **RDS (MySQL)**.
5. **Las lambdas PE/CL** envían una confirmación a **EventBridge**.
6. **EventBridge** enruta la confirmación a un **SQS** de confirmaciones.
7. **Lambda `appointment`** lee del SQS de confirmaciones y actualiza el estado de la cita en **DynamoDB** como `completed`.

---

## 🗂️ Infraestructura AWS

- **API Gateway** → para exponer endpoints HTTP.
- **Lambda Functions**:
  - `appointment` (POST / GET / update estado).
  - `appointment_pe` (procesar citas Perú).
  - `appointment_cl` (procesar citas Chile).
- **DynamoDB**: almacenamiento temporal de agendamientos (estado `pending` / `completed`).
- **SNS Topics**: distribución de mensajes según país.
- **SQS Queues**:
  - `SQS_PE`: cola para agendamientos de Perú.
  - `SQS_CL`: cola para agendamientos de Chile.
  - `SQS_CONFIRMATIONS`: cola para eventos de confirmación.
- **EventBridge**: distribución de eventos de confirmación.

---

## 📑 Endpoints

### 1. Crear un agendamiento

**POST** `/appointments`

- **Request Body:**
```json
{
  "insuredId": "00012",
  "scheduleId": 100,
  "countryISO": "PE"
}
```

- **Response:**
```json
{
  "message": "Appointment created successfully"
}
```

---

### 2. Consultar agendamientos por asegurado

**GET** `/appointments/{insuredId}`

- **Path Parameter:**
  - `insuredId`: ID del asegurado (ejemplo: `00012`)

- **Response:**
```json
[
  {
    "insuredId": "00012",
    "scheduleId": 100,
    "countryISO": "PE",
    "status": "pending"
  }
]
```

---

## 🛠️ Setup Local

### 1. Clonar el proyecto

```bash
git clone https://github.com/tu_usuario/rimac-backend-citas.git
cd rimac-backend-citas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Levantar entorno local

```bash
npx serverless offline
```

El servicio estará disponible en:
```
http://localhost:3000
```

---

## 🚀 Despliegue en AWS

Asegúrate de tener configuradas tus credenciales de AWS.

```bash
npx serverless deploy
```

---

## 🧪 Pruebas Unitarias

Las pruebas unitarias están escritas con **Jest**.

Para ejecutar las pruebas:

```bash
npm run test
```

---

## 📝 Documentación OpenAPI (Swagger)

Se encuentra el archivo `openapi.yaml` en la raíz del proyecto.

Puedes visualizarlo usando cualquier visor de Swagger (por ejemplo, [Swagger Editor](https://editor.swagger.io/)).

La documentación incluye:
- Request/Response de los endpoints.
- Especificaciones de errores (400, 404, etc.)

---

## 📦 Tecnologías utilizadas

- Node.js 18.x
- TypeScript
- AWS Lambda
- API Gateway
- DynamoDB
- SNS
- SQS
- EventBridge
- RDS (MySQL)
- Serverless Framework
- Jest (pruebas unitarias)

---

## 📋 Consideraciones

- No se implementó reintentos ni fallback en caso de error.
- No se maneja la lógica de reenvío de correo de confirmación (fuera del alcance del reto).
- Se asumió que el RDS ya existe y está configurado.

---

# ✨ Autor

Desarrollado como solución para el **Reto Técnico Backend Rimac 2024**.

