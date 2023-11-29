#!/bin/bash

# install docker
echo '==== install docker ===='
sudo yum install update -y
sudo yum install docker -y
sudo systemctl enable docker.service
sudo systemctl start docker.service

# install docker-compose
echo '==== install docker-compose ===='
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# create folder and change to the dir
echo '==== create folder and change to the dir ===='
sudo mkdir /home/ec2-user/automation_se
cd /home/ec2-user/automation_se

# setup docker-compose
echo '==== setup docker-compose ===='
export auth_token=$1
export auth_secret=$2
export server_validation_code=$3
export server_addr=$4
export network_type=$5d83
export network_name=$6
export service_edge_number=$7
export proxyUrl=$8  # if need to connect through proxy. Format is http://[username:password@]proxyAddr
export label=$9      # only applicable to device-mesh, should be unique
export serialno=${10}   # only applicable to device-mesh, must be unique

# create docker compose file
echo '==== create docker compose file ===='
sudo cat << EOF > docker-compose.yml
SE_DOCKER_COMPOSE_FILE
EOF

echo '==== let docker compose up ===='
sudo docker-compose up --detach --force-recreate --remove-orphans