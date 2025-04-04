# Reto Técnico Rimac Backend 2024

## 🩺 Aplicación de agendamiento de cita médica para asegurados

Este proyecto implementa una solución backend serverless para agendar citas médicas para asegurados en Perú y Chile, usando AWS y buenas prácticas de arquitectura de software.

---

## 📚 Descripción Técnica

La aplicación permite a un asegurado:
- Agendar una cita médica (estado inicial: `pending` en DynamoDB).
- Consultar sus citas registradas.
- Procesar las citas dependiendo del país (`PE` o `CL`).
- Guardar los datos procesados en una base de datos MySQL (RDS).
- Confirmar el agendamiento finalizando el estado como `completed` en DynamoDB.

---

## 🏛️ Arquitectura

El flujo general de la aplicación es:

1. **POST** solicitud de cita → Lambda `appointment` guarda en DynamoDB (`pending`).
2. **Lambda `appointment`** publica el evento en un **SNS Topic**.
3. **SNS** enruta el evento a **SQS_PE** o **SQS_CL** según `countryISO`.
4. **Lambdas `appointment_pe` o `appointment_cl`**:
   - Leen el mensaje desde su respectivo SQS.
   - Guardan la cita en una base de datos **MySQL (RDS)**.
   - Publican un evento de confirmación en **EventBridge**.
5. **EventBridge** enruta el evento a una **SQS de confirmaciones**.
6. **Lambda `appointment`** escucha el SQS de confirmaciones y actualiza la cita en **DynamoDB** como `completed`.

---

## 🗂️ Infraestructura AWS

- **API Gateway** → Exponer endpoints HTTP.
- **Lambda Functions**:
  - `appointment` (POST/GET citas, escuchar confirmaciones de EventBridge).
  - `appointment_pe` (procesar citas Perú).
  - `appointment_cl` (procesar citas Chile).
- **DynamoDB**: almacenamiento temporal de agendamientos (`pending`/`completed`).
- **SNS Topic**: distribución de mensajes según país.
- **SQS Queues**:
  - `SQS_PE`: cola para citas de Perú.
  - `SQS_CL`: cola para citas de Chile.
  - `SQS_CONFIRMATIONS`: cola para confirmaciones.
- **EventBridge**: distribución de eventos de confirmación.
- **RDS MySQL**: almacenamiento definitivo de citas.

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
  "message": "Appointment created and published to SNS successfully"
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

*(Si ya fue procesado y confirmado, el `status` será `completed`.)*

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

### 3. Configurar variables de entorno en `serverless.yml`

Modificar en `serverless.yml` las variables de RDS:

```yaml
provider:
  environment:
    RDS_HOST: tu-host
    RDS_PORT: 3306
    RDS_USER: tu-usuario
    RDS_PASSWORD: tu-contraseña
    RDS_DATABASE: tu-bd
```

*(Simular si no tienes una base de datos real.)*

### 4. Levantar entorno local

```bash
npx serverless offline
```

El servicio estará disponible en:
```
http://localhost:3000
```

---

## 🚀 Despliegue en AWS

Asegúrate de tener configuradas tus credenciales de AWS CLI:

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

## 🧪 Cómo probar el flujo completo manualmente

1. **Crear cita** (POST `/appointments`)
2. **Verificar cita** (GET `/appointments/{insuredId}` ➔ debe tener `status: pending`)
3. **Esperar procesamiento automático**:
   - Lambda `appointment_pe` o `appointment_cl` procesa la cita.
   - Se confirma vía EventBridge.
   - Lambda `appointment` actualiza el `status` a `completed`.
4. **Consultar de nuevo** (GET `/appointments/{insuredId}` ➔ ahora debe tener `status: completed`).

---

## 📝 Documentación OpenAPI (Swagger)

Se encuentra el archivo `openapi.yaml` en la raíz del proyecto.

Puedes visualizarlo usando [Swagger Editor](https://editor.swagger.io/).

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

- No se implementaron reintentos en caso de error (flujo "happy path").
- No se implementó el envío de correos electrónicos.
- Se asumió que la base de datos RDS MySQL ya existe.

---


