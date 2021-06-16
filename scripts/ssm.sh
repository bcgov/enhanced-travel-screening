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