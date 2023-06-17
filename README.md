# Plataforma de guías descentralizada

## Requisitos para desplegar la plataforma
Se deben instalar las siguientes herramientas:

- Ganache: Para desplegar una blockchain Ethereum en local.
- Truffle: Para programar, compilar y desplegar el Smart Contract.
- IPFS: Para poder almacenar las guías.
- npm: Para gestionar las librarías necesarias para desplegar el front.

## Instrucciones para desplegar la plataforma

1. Configurar un entorno de trabajo en [Ganache](https://trufflesuite.com/ganache/) usando la interfaz gráfica.

2. Ejecutar el siguiente comando desde la carpeta `back-end` para compilar y desplegar el Smart Contract usando Truffle.

```bash
truffle migrate
```

3. Lanzar el servicio de [IPFS](https://docs.ipfs.tech/install/ipfs-desktop/).

4. Ejecutar el siguiente comando desde la carpeta `front-end` para instalar las librerías necesarias para el front.

```bash
npm install
```

5. Finalmente, ejecutar el siguiente comando para desplegar la aplicación.

```bash
parcel index.html
```