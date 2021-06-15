#!/bin/sh

echo "Please enter your MFA code"
read TOKEN
PROFILE="lz0"
DEVICE=`aws --profile "$PROFILE" iam list-mfa-devices | jq -r '.MFADevices[0].SerialNumber'`
CREDS=`aws --profile "$PROFILE" sts get-session-token --serial-number $DEVICE --token-code $TOKEN`
export AWS_ACCESS_KEY_ID=`echo "$CREDS" | jq -r '.Credentials.AccessKeyId'`
export AWS_SECRET_ACCESS_KEY=`echo "$CREDS" | jq -r '.Credentials.SecretAccessKey'`
export AWS_SESSION_TOKEN=`echo "$CREDS" | jq -r '.Credentials.SessionToken'`
export AWS_DEFAULT_REGION="ca-central-1"

mongodump --ssl --host ets-dev.cluster-cyk1pye3ihk7.ca-central-1.docdb.amazonaws.com:27017 --sslCAFile rds-combined-ca-bundle.pem --username etsmasterdev --password <password> --db ets-dev --out dump
scp -r -i ~/.ssh/ets_bastion_host.pem ec2-user@ec2-3-96-194-192.ca-central-1.compute.amazonaws.com:/home/ec2-user/dump ./


# local
mongorestore --tls --tlsCAFile rds-combined-ca-bundle.pem --host klwrig-dev.cluster-cgcqnzo2vul6.ca-central-1.docdb.amazonaws.com:27017 --username root --password LrCQxCrtyHEEk6x2 --db ets-dev --drop ./dump/ets-dev/

# dev
mongorestore --ssl --host klwrig-dev.cluster-cgcqnzo2vul6.ca-central-1.docdb.amazonaws.com:27017 --username root --password <password> --sslCAFile rds-combined-ca-bundle.pem --db ets-dev --drop ./dump/ets-dev/
