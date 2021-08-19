#!/usr/bin/env bash

# This script generates certificate for client vpn
# AWS Client VPN Pricing: https://aws.amazon.com/vpn/pricing/

REGION=${1?"Region Parameter Missing !"}
ENV=${2?"Environment Parameter Missing !"}
DOMAIN=${3?"VPN Domain Name Missing !"}
NAME=${4?"User Name Missing !"}
ENDPOINT=${5?"Full Endpoint - cvpn-endpoint-xxxxxxxxx !"}

REPO_LOCATION=$(git rev-parse --show-toplevel)

export EASYRSA_BATCH=1

client="$4"
cert_domain="$3"
client_full="${client}.${cert_domain}"
outfile="/tmp/${client}-${ENV}-cvpn-endpoint.ovpn"
vpn_endpoint_id="$ENDPOINT"

tput setaf 2; echo ">> clone repo ..."; tput setaf 9
cd `mktemp -d`
git clone https://github.com/OpenVPN/easy-rsa.git
cd easy-rsa/easyrsa3

tput setaf 2; echo ">> init ..."; tput setaf 9
./easyrsa init-pki
./easyrsa build-ca nopass
rm -f pki/ca.crt
rm -f pki/private/ca.key

tput setaf 2; echo ">> get ca crt/key from param store ..."; tput setaf 9
(aws ssm get-parameters \
    --region ${REGION} \
    --names /vpn/${ENV}/crt/ca \
    --with-decryption \
    --query Parameters[0].Value \
    --output text || exit 2) | base64 --decode > pki/ca.crt
(aws ssm get-parameters \
    --region ${REGION} \
    --names /vpn/${ENV}/key/ca \
    --with-decryption \
    --query Parameters[0].Value \
    --output text || exit 3) | base64 --decode > pki/private/ca.key

tput setaf 2; echo ">> create and import crt/key for $client ..."; tput setaf 9
./easyrsa build-client-full ${client_full} nopass

tput setaf 2; echo ">> generate vpn client config file ..."; tput setaf 9

# route only VPC CIDR through VPN
echo "route-nopull"                 >> $outfile
echo "route 10.12.0.0 255.255.0.0"  >> $outfile

aws ec2 export-client-vpn-client-configuration \
    --client-vpn-endpoint-id $vpn_endpoint_id \
    --region ${REGION} \
    --output text >> $outfile

sed -i~ "s/^remote /remote ${client}./" $outfile
echo "<cert>"                      >> $outfile
cat pki/issued/${client_full}.crt  >> $outfile
echo "</cert>"                     >> $outfile
echo "<key>"                       >> $outfile
cat pki/private/${client_full}.key >> $outfile
echo "</key>"                      >> $outfile

tput setaf 2; echo ">> $outfile ..."; tput setaf 9
ls -alh $outfile

mv $outfile ${REPO_LOCATION}/