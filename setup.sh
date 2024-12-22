#!/bin/bash

# Make sure the script is running as root
if [ "$(id -u)" != "0" ]; then
    echo -e "${BLUE}This script must be run as root.${NC}"
    exit 1
fi

# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-compose docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y


if [ -d "ir_tracking_post_api_node" ]; then
    echo -e "${BLUE}Deleting existing xVpn directory...${NC}"
    rm -rf ir_tracking_post_api_node
fi

# Clone the repository
git clone https://github.com/RZAsadi/ir_tracking_post_api_node.git

# Change to the project directory
cd ir_tracking_post_api_node

# Down the last container
docker-compose down

# Build & Run new Container
docker-compose up --build -d

echo -e "${BLUE}ir_tracking_post_api installed successfully.${NC}"