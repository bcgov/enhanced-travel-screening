resource "aws_security_group" "lambda_access" {
  name   = "${var.target_env}-lambda-access"
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

resource "aws_lambda_function" "api" {
  description      = "API for ${local.namespace}"
  function_name    = local.api_name
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs14.x"
  filename         = var.api_zip
  source_code_hash = filebase64sha256(var.api_zip)
  handler          = "lambda.handler"
  memory_size      = 1024
  timeout          = 10

  vpc_config {
    security_group_ids = [aws_security_group.lambda_access.id]
    subnet_ids         = module.network.aws_subnet_ids.app.ids
  }

  environment {
    variables = {
      NODE_ENV = var.target_env
      VERSION  = var.git_version

      DB_SERVER = aws_docdb_cluster.db_cluster.endpoint

      SBC_USER                  = "phoct"
      DB_AWS_TLS_ENABLED        = "true"
      DB_NAME                   = "ets-${var.target_env}"
      DB_PORT                   = "27017"
      DB_USER                   = "root"
      DB_WRITE_SERVICE_DISABLED = "false"
      ENABLE_PHAC_CRONJOB       = "true"

      DB_PASSWORD    = data.aws_ssm_parameter.database_password.value
      SBC_CLI_SECRET = data.aws_ssm_parameter.sbc_cli_secret.value
      SBC_PW         = data.aws_ssm_parameter.sbc_password.value
      JWT_SECRET     = data.aws_ssm_parameter.jwt_secret.value
      PASSWORD_SALT  = data.aws_ssm_parameter.password_salt.value
      SLACK_ENDPOINT = data.aws_ssm_parameter.slack_endpoint.value
    }
  }
}

resource "aws_apigatewayv2_api" "api" {
  name          = local.api_name
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "api" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  connection_type    = "INTERNET"
  description        = local.api_name
  integration_method = "POST"
  integration_uri    = aws_lambda_function.api.invoke_arn
}

resource "aws_apigatewayv2_route" "api" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

locals {
  api_gateway_log_format_with_newlines = <<EOF
{ 
"requestId":"$context.requestId",
"ip":"$context.identity.sourceIp",
"requestTime":"$context.requestTime",
"httpMethod":"$context.httpMethod",
"status":"$context.status",
"responseLength":"$context.responseLength",
"errorMessage":"$context.error.message"
}
EOF
  api_gateway_log_format               = replace(local.api_gateway_log_format_with_newlines, "\n", "")
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_logs.arn
    format          = local.api_gateway_log_format
  }
}

resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "${local.api_name}/gateway_logs"
  retention_in_days = 90
}

resource "aws_lambda_permission" "api_allow_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_stage.api.execution_arn}/*"
}

output "api_gateway_url" {
  value = aws_apigatewayv2_stage.api.invoke_url
}
