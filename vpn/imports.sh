#!/bin/bash
set -e


REGION=${1?"Region Parameter Missing !"}
ENV=${2?"Environment Parameter Missing !"}
VPN_DOMAIN=${3?"VPN Domain Name Missing !"}

REPO_LOCATION=$(git rev-parse --show-toplevel)
PKI_DIR=${REPO_LOCATION}/easy-rsa/easyrsa3

# Resources: 
# https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/client-authentication.html
# https://cwong47.gitlab.io/technology-terraform-aws-client-vpn/


# git clone https://github.com/OpenVPN/easy-rsa.git
# run the following to generate the CA and keys then delete the folder

# ./easyrsa init-pki
# ./easyrsa build-ca nopass
# ./easyrsa build-server-full server.env-name-vpn.comapny.com nopass
# ./easyrsa build-client-full client.env-name-vpn.company.com nopass


VPN_SERVER="server.${VPN_DOMAIN}"
VPN_CLIENT="client.${VPN_DOMAIN}"           


aws acm import-certificate \
    --region ${REGION} \
    --certificate fileb://${PKI_DIR}/pki/issued/${VPN_SERVER}.crt \
    --private-key fileb://${PKI_DIR}/pki/private/${VPN_SERVER}.key \
    --certificate-chain fileb://${PKI_DIR}/pki/ca.crt \
    --tags Key=Name,Value=${ENV}-vpn-server

aws acm import-certificate \
    --region ${REGION} \
    --certificate fileb://${PKI_DIR}/pki/issued/${VPN_CLIENT}.crt \
    --private-key fileb://${PKI_DIR}/pki/private/${VPN_CLIENT}.key \
    --certificate-chain fileb://${PKI_DIR}/pki/ca.crt \
    --tags Key=Name,Value=${ENV}-vpn-client

aws ssm put-parameter \
    --region ${REGION} \
    --name /vpn/${ENV}/crt/ca \
    --value "$(cat ${PKI_DIR}/pki/ca.crt | base64)" \
    --type SecureString \
    --overwrite

aws ssm put-parameter \
    --region ${REGION} \
    --name /vpn/${ENV}/key/ca \
    --value "$(cat ${PKI_DIR}/pki/private/ca.key | base64)" \
    --type SecureString \
    --overwrite
