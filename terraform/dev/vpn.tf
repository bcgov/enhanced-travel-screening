
# # ===============
# # VPN Setup 
# # ===============

# we must create these two first. Use imports.sh
data "aws_acm_certificate" "server" {
  domain   = "server.${var.target_env}-ets-vpn.freshworks.club"
  statuses = ["ISSUED"]
}

data "aws_acm_certificate" "client" {
  domain   = "client.${var.target_env}-ets-vpn.freshworks.club"
  statuses = ["ISSUED"]
}


resource "aws_cloudwatch_log_group" "vpn" {
  name = "vpn/${var.target_env}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ec2_client_vpn_endpoint" "client_vpn_endpoint" {
  description            = "client vpn for connecting to vpc"
  server_certificate_arn = data.aws_acm_certificate.server.arn
  client_cidr_block      = "10.50.0.0/22"
  split_tunnel           = false

  authentication_options {
    type                       = "certificate-authentication"
    root_certificate_chain_arn = data.aws_acm_certificate.client.arn
  }

  connection_log_options {
    enabled              = true
    cloudwatch_log_group = aws_cloudwatch_log_group.vpn.name
  }
}

resource "aws_security_group" "vpn_access" {
  name   = "shared-vpn-access"
  vpc_id = module.network.aws_vpc.id
  ingress {
    from_port   = 0
    protocol    = "-1"
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    protocol    = "-1"
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "null_resource" "client_vpn_security_group" {
  depends_on = [aws_ec2_client_vpn_endpoint.client_vpn_endpoint]
  #  provisioner "local-exec" {
  #    when = create
  #    command = "aws ec2 apply-security-groups-to-client-vpn-target-network --client-vpn-endpoint-id ${aws_ec2_client_vpn_endpoint.client_vpn_endpoint.id} --vpc-id ${aws_security_group.vpn_access.vpc_id} --security-group-ids ${aws_security_group.vpn_access.id} --region ${var.region}"
  #  }

  provisioner "local-exec" {
    command = <<EOF
      aws_credentials=$( aws sts assume-role --role-arn arn:aws:iam::${local.account_id}:role/BCGOV_${var.target_env}_Automation_Admin_Role --role-session-name tf-provisioner) &&
      export AWS_ACCESS_KEY_ID=$(echo $aws_credentials|jq '.Credentials.AccessKeyId'|tr -d '"') &&
      export AWS_SECRET_ACCESS_KEY=$(echo $aws_credentials|jq '.Credentials.SecretAccessKey'|tr -d '"') &&
      export AWS_SESSION_TOKEN=$(echo $aws_credentials|jq '.Credentials.SessionToken'|tr -d '"') &&
      aws ec2 apply-security-groups-to-client-vpn-target-network --client-vpn-endpoint-id ${aws_ec2_client_vpn_endpoint.client_vpn_endpoint.id} --vpc-id ${aws_security_group.vpn_access.vpc_id} --security-group-ids ${aws_security_group.vpn_access.id} --region ${var.region}
    EOF
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_ec2_client_vpn_network_association" "client_vpn_network_association_1" {

  depends_on             = [null_resource.client_vpn_security_group]
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.client_vpn_endpoint.id
  subnet_id              = element(tolist(module.network.aws_subnet_ids.data.ids), 0)
  security_groups        = [aws_security_group.vpn_access.id]
}

resource "aws_ec2_client_vpn_network_association" "client_vpn_network_association_2" {
  depends_on             = [null_resource.client_vpn_security_group]
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.client_vpn_endpoint.id
  subnet_id              = element(tolist(module.network.aws_subnet_ids.data.ids), 1)
  security_groups        = [aws_security_group.vpn_access.id]
}


# vpn route table egress subnet 1
resource "aws_ec2_client_vpn_route" "client_vpn_route_1" {
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.client_vpn_endpoint.id
  destination_cidr_block = "0.0.0.0/0"
  target_vpc_subnet_id   = aws_ec2_client_vpn_network_association.client_vpn_network_association_1.subnet_id
}

# vpn route table egress subnet 2
resource "aws_ec2_client_vpn_route" "client_vpn_route_2" {
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.client_vpn_endpoint.id
  destination_cidr_block = "0.0.0.0/0"
  target_vpc_subnet_id   = aws_ec2_client_vpn_network_association.client_vpn_network_association_2.subnet_id
}

resource "aws_ec2_client_vpn_authorization_rule" "authorize" {
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.client_vpn_endpoint.id
  target_network_cidr    = "0.0.0.0/0"
  authorize_all_groups   = true
}
