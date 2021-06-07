
# ===============
# VPN Setup 
# ===============

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

resource "aws_ec2_client_vpn_network_association" "client_vpn_network_association_1" {
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.client_vpn_endpoint.id
  subnet_id              = module.network.aws_subnet_ids.data.ids[0]
}

resource "aws_ec2_client_vpn_network_association" "client_vpn_network_association_2" {
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.client_vpn_endpoint.id
  subnet_id              = module.network.aws_subnet_ids.data.ids[1]
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