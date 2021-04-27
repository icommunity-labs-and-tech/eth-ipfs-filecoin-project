# Pasos para desplegar el modulo Hyperledger BESU


## Levantar nodo con Docker

### Crear el volumen

Primero debemos crear el volumen donde se guardaran los bloques generados y las keys.

docker volume create {NOMBRE DEL VOLUMEN}

Dependiendo de la red nodetest, noderinkeby o nodemainnet


#### Rinkeby

`docker run -dt --name besu-rinkeby -p 30303:30303 -v noderinkeby:/opt/besu -w /opt/besu hyperledger/besu:latest --network=rinkeby --rpc-http-enabled`

#### Local

`docker run -dt --name besu-testnet -p 8546:8546 -v nodetest:/opt/besu -w /opt/besu hyperledger/besu:latest --miner-enabled --miner-coinbase fe3b557e8fb62b89f4916b721be55ceb828dbd73 --rpc-ws-enabled --network=dev`

#### Mainnet

`docker run -dt --name mainnet-rinkeby -p 8545:8545 -v nodemainnet:/opt/besu -w /opt/besu hyperledger/besu:latest -rpc-http-enabled`

#### Parar el nodo

`docker stop <container-name>`