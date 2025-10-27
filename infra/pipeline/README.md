Console checklist (one time)

1. Create role/cogira-cfn-exec with the trust and permissions above.

2. Attach the user policy above to your IAM user (or a group/permission set).

3. In CloudFormation → Create stack, upload your SAM template:

- Execution role: ARN of role/cogira-cfn-exec

- Capabilities: check IAM and Named IAM (your template creates roles with explicit names).

- Parameters: ExistingRepoName=cogira-backend, etc.

4. Create stack.
