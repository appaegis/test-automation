#!/bin/bash

echo '==== touch /etc/ssh/trusted-user-ca-keys.pem ===='
touch /etc/ssh/trusted-user-ca-keys.pem
sudo cat << EOF > /etc/ssh/trusted-user-ca-keys.pem
CA_PUBLIC_KEY
EOF

echo 'TrustedUserCAKeys /etc/ssh/trusted-user-ca-keys.pem' | sudo tee -a /etc/ssh/sshd_config

sudo systemctl restart sshd