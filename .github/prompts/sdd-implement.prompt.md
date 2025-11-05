<!--
Copyright (c) Github Speckit
MIT License
-->

# Implement

Execute the implementation plan by progressively executing all tasks defined in tasks.md

## Usage

- `@sdd-implement <feature-name>` - Execute implementation for specified feature

**Note**: The `<feature-name>` parameter is **REQUIRED**. If not provided, an error will be generated.

---

## Execute Implementation

The user **MUST** provide a feature name. This parameter is compulsory.

### Steps

1. **Validate feature name parameter (Deterministic Algorithm)**:

   **Step 1.1**: Check parameter existence
   - IF no feature name provided → RETURN ERROR "Feature name is required. Usage: @sdd-implement <feature-name>"

   **Step 1.2**: Validate feature directory
   - IF `specs/<feature-name>` does not exist → RETURN ERROR "Feature '<feature-name>' not found in specs/. Available features: [list directory names from specs/]"
   - IF `specs/<feature-name>` is not readable → RETURN ERROR "Cannot access feature directory: specs/<feature-name>"

   **Step 1.3**: Set environment
   - SET FEATURE_NAME = <feature-name>
   - CONTINUE to step 2

2. Run `.specify/scripts/powershell/check-implementation-prerequisites.ps1 <feature-name> --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute.

3. Load and analyze the implementation context:
   - **REQUIRED**: Read tasks.md for the complete task list and execution plan
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **IF EXISTS**: Read data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ for API specifications and test requirements
   - **IF EXISTS**: Read research.md for technical decisions and constraints
   - **IF EXISTS**: Read quickstart.md for integration scenarios

4. **Load Constitutional Standards (Just-In-Time)**: Analyze the task being implemented and load only relevant sections:

   **File Type Detection Priority (First Match Wins)**:
   1. If implementing **test files** (`*.test.*`, `*.spec.*`): Load `testing,branching`
   2. If implementing **auth/security** (`auth*`, `security*`, `validation*`): Load `core,security,branching`
   3. If implementing **API/routes** (`routes/`, `controllers/`, `endpoints/`): Load `core,architecture,security,branching`
   4. If implementing **service/business logic** (`services/`, `handlers/`): Load `core,architecture,observability,branching`
   5. If implementing **database/models** (`models/`, `entities/`, `repositories/`): Load `core,architecture,branching`
   6. If implementing **config/deployment** (`*.yml`, `*.yaml`, `Dockerfile`): Load `operations,security,branching`
   7. If implementing **logging/monitoring** (`logger*`, `monitor*`, `metrics*`): Load `observability,branching`
   8. **DEFAULT**: Load `core,branching`

   **Execution**:

   ```powershell
   # Detect file type from current task
   # Then load appropriate sections
   .specify/scripts/powershell/load-constitution.ps1 "<section-list>"
   ```

   **Purpose**: Load only standards needed for the current implementation task.

   **Re-load on Task Change**: When moving to a different task category, reload appropriate sections.

5. Parse tasks.md structure and extract:
   - **Task phases**: Setup, Tests, Core, Integration, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements

6. Execute implementation following the task plan:

   **Task Execution Decision Matrix**:
   - IF (Task A [P] AND Task B [P] AND same_file(A,B)) → Execute A THEN B (sequential override)
   - IF (Task A requires Task B AND Task B [P]) → Wait for B completion before A
   - IF (Task fails AND has_dependents) → Halt phase, report blocking tasks
   - IF (Parallel task fails) → Continue others, aggregate failures at phase end

   **Execution Rules**:
   - **Phase-by-phase execution**: Complete each phase before moving to the next
   - **Respect dependencies**: Run sequential tasks in order, parallel tasks [P] can run together
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks
   - **File-based coordination**: Tasks affecting the same files must run sequentially
   - **Validation checkpoints**: Verify each phase completion before proceeding
   - **Apply Constitutional Standards**: For each implementation, follow:
     - **Coding standards**: Error handling, logging patterns, validation (from core)
     - **Architectural patterns**: Service structure, API design (from architecture)
     - **Testing requirements**: Test organization, coverage, mocking (from testing)
     - **Security practices**: Input validation, secrets management, auth (from security)
     - **Observability**: Structured logging, correlation IDs, metrics (from observability)

7. Implementation execution rules:
   - **Setup first**: Initialize project structure, dependencies, configuration
   - **Tests before code**: If you need to write tests for contracts, entities, and integration scenarios
   - **Core development**: Implement models, services, CLI commands, endpoints
   - **Integration work**: Database connections, middleware, logging, external services
   - **Polish and validation**: Unit tests, performance optimization, documentation

8. Progress tracking and error handling:

   **Task Update State Machine**:
   1. EXECUTING → Mark task in progress
   2. COMPLETED → Attempt file update (max 3 retries, 1s delay)
   3. UPDATE_SUCCESS → Move to next task
   4. UPDATE_FAILED → Log warning, add to completion_report_queue
   5. PHASE_END → Batch update any failed updates from queue

   **Error Handling Rules**:
   - Report progress after each completed task
   - **IMMEDIATELY after task completion**: Update tasks.md to mark task as [X]
   - **Verify update**: Confirm the task file was successfully modified
   - **Atomic updates**: Update one task at a time to avoid file corruption
   - Halt execution if any non-parallel task fails
   - For parallel tasks [P], continue with successful tasks, report failed ones
   - **Task update failure handling**: If task marking fails, log warning but continue implementation
   - Provide clear error messages with context for debugging
   - Suggest next steps if implementation cannot proceed
   - **IMPORTANT** For completed tasks, make sure to mark the task off as [X] in the tasks file.
   - **Backup mechanism**: If direct file update fails, provide explicit instruction to user about which tasks were completed

9. Completion validation:
   - **Final task audit**: Compare completed work against tasks.md to identify any unmarked completed tasks
   - **Batch update missed tasks**: If any completed tasks aren't marked [X], update them all at once
   - Verify all required tasks are completed
   - Check that implemented features match the original specification
   - Validate that tests pass and coverage meets requirements
   - Confirm the implementation follows the technical plan
   - **Generate completion report**: List all tasks with their final status (completed [X] vs pending [ ])
   - Report final status with summary of completed work

Note: This command assumes a complete task breakdown exists in sdd-tasks.md. If tasks are incomplete or missing, suggest running the sdd-tasks prompt first to regenerate the task list.
