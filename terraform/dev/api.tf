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
      BCS_CLI_SECRET            = "e63df438-4776-4f81-b1f7-5e6847870c56"
      BCS_PW                    = "p3wU*B^3z694"
      BCS_USER                  = "phoct"
      DB_AWS_TLS_ENABLED        = "true"
      DB_NAME                   = "ets-${var.target_env}"
      DB_PASSWORD               = data.aws_ssm_parameter.database_password.value
      DB_SERVER                 = aws_docdb_cluster.db_cluster.endpoint
      DB_PORT                   = "27017"
      DB_USER                   = "root"
      VERSION                   = var.git_version
      DB_WRITE_SERVICE_DISABLED = "false"
      ENABLE_PHAC_CRONJOB       = "true"
      JWT_SECRET                = "a10ed69838e65cf075b54fa8a15d2e3156b1d83f9df38f1c478a273590463de2"
      NODE_ENV                  = var.target_env
      PASSWORD_SALT             = "16adfae0b3afab932b65282a73721765"
      VERSION                   = var.git_version
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
  name = "${local.api_name}/gateway_logs"
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
