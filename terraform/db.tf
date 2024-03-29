resource "aws_docdb_cluster" "db_cluster" {
  cluster_identifier              = local.namespace
  engine                          = "docdb"
  master_username                 = "root"
  master_password                 = data.aws_ssm_parameter.database_password.value
  backup_retention_period         = 5
  preferred_backup_window         = "10:00-12:00"
  skip_final_snapshot             = false
  final_snapshot_identifier       = "${var.target_env}-finalbackup"
  apply_immediately               = true
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.db_param_group.name
  deletion_protection             = false
  enabled_cloudwatch_logs_exports = ["audit", "profiler"]
  storage_encrypted               = true
  db_subnet_group_name            = aws_docdb_subnet_group.db_subnet_group.id
  vpc_security_group_ids          = [module.network.aws_security_groups.data.id, module.network.aws_security_groups.app.id, aws_security_group.vpn_access.id, aws_security_group.lambda_access.id]
}


resource "aws_docdb_subnet_group" "db_subnet_group" {
  name       = "${var.target_env}-db-subnet-grp"
  subnet_ids = module.network.aws_subnet_ids.data.ids
}

resource "aws_docdb_cluster_instance" "cluster_instances" {
  # count              = var.target_env == "dev" ? 1 : 2
  count              = 2
  identifier         = "${local.namespace}-docdb-instance-${count.index + 1}"
  cluster_identifier = aws_docdb_cluster.db_cluster.id
  apply_immediately  = false
  instance_class     = "db.t3.medium"
  engine             = "docdb"
}


resource "aws_docdb_cluster_parameter_group" "db_param_group" {
  family      = "docdb4.0"
  name        = "${var.target_env}-docdb-param-group"
  description = "docdb cluster parameter group"

  parameter {
    name         = "tls"
    value        = "enabled"
    apply_method = "pending-reboot"
  }
}

output "database_url" {
  value = aws_docdb_cluster.db_cluster.endpoint
}
