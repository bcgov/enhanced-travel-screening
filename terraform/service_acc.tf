

data "aws_iam_policy_document" "service_account" {
  statement {
    sid    = "AllowS3FullAccess"
    effect = "Allow"
    actions = [
      "s3:DeleteObject",
      "s3:GetBucketLocation",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:PutObject",
      "s3:PutObjectAcl"
    ]
    resources = [
      "arn:aws:s3:::ets-app-*",
      "arn:aws:s3:::ets-app-*/*",
    ]
  }
  statement {
    sid    = "AllowCFInvalidationAccess"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetDistribution",
      "cloudfront:GetStreamingDistribution",
      "cloudfront:GetDistributionConfig",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations",
      "cloudfront:ListStreamingDistributions",
      "cloudfront:ListDistributions"
    ]
    resources = [
      "arn:aws:cloudfront::560234080437:distribution/*", # klwrig-dev 
      "arn:aws:cloudfront::156222003510:distribution/*", # klwrig-test
      "arn:aws:cloudfront::026615665612:distribution/*", # klwrig-prod
    ]
  }
}


# output "service_account_iam" {
#   value = data.aws_iam_policy_document.service_account.json
# }
