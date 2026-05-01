import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// ---------------------------------------------------------------------------
// Pipeline Run operations
// ---------------------------------------------------------------------------

/**
 * Creates a new pipeline run record.
 * @param {object} run - { request_summary: string, status?: string }
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createPipelineRun(run) {
  try {
    const { data, error } = await supabaseAdmin
      .from('pipeline_runs')
      .insert(run)
      .select()
      .single()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

/**
 * Updates an existing pipeline run by ID.
 * @param {string} id - Pipeline run UUID
 * @param {object} updates - Partial pipeline run fields to update
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updatePipelineRun(id, updates) {
  try {
    const { data, error } = await supabaseAdmin
      .from('pipeline_runs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

/**
 * Retrieves a pipeline run by ID.
 * @param {string} id - Pipeline run UUID
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getPipelineRun(id) {
  try {
    const { data, error } = await supabaseAdmin
      .from('pipeline_runs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

// ---------------------------------------------------------------------------
// Task operations
// ---------------------------------------------------------------------------

/**
 * Creates multiple tasks in a single insert.
 * @param {object[]} tasks - Array of task objects to insert
 * @returns {Promise<{ data: object[]|null, error: object|null }>}
 */
export async function createTasks(tasks) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert(tasks)
      .select()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

/**
 * Updates a single task by ID.
 * @param {string} id - Task UUID
 * @param {object} updates - Partial task fields to update
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateTask(id, updates) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

/**
 * Retrieves all tasks for a given pipeline, ordered by created_at.
 * @param {string} pipelineId - Pipeline run UUID
 * @returns {Promise<{ data: object[]|null, error: object|null }>}
 */
export async function getTasksByPipeline(pipelineId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .order('created_at', { ascending: true })

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

// ---------------------------------------------------------------------------
// Artifact operations
// ---------------------------------------------------------------------------

/**
 * Creates a new artifact record.
 * @param {object} artifact - Artifact data to insert
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createArtifact(artifact) {
  try {
    const { data, error } = await supabaseAdmin
      .from('artifacts')
      .insert(artifact)
      .select()
      .single()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

/**
 * Retrieves artifacts with optional filtering by artifact_type.
 * Results are sorted by created_at descending (newest first).
 * @param {object} [filters={}] - Optional filters
 * @param {string} [filters.artifact_type] - Filter by artifact type
 * @returns {Promise<{ data: object[]|null, error: object|null }>}
 */
export async function getArtifacts(filters = {}) {
  try {
    let query = supabaseAdmin
      .from('artifacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.artifact_type) {
      query = query.eq('artifact_type', filters.artifact_type)
    }

    const { data, error } = await query

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

/**
 * Retrieves a single artifact by ID.
 * @param {string} id - Artifact UUID
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getArtifactById(id) {
  try {
    const { data, error } = await supabaseAdmin
      .from('artifacts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

// ---------------------------------------------------------------------------
// Agent Role operations
// ---------------------------------------------------------------------------

/**
 * Retrieves all agent roles with status 'active'.
 * @returns {Promise<{ data: object[]|null, error: object|null }>}
 */
export async function getActiveAgentRoles() {
  try {
    const { data, error } = await supabaseAdmin
      .from('agent_roles')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

/**
 * Retrieves a single agent role by ID.
 * @param {string} id - Agent role UUID
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getAgentRoleById(id) {
  try {
    const { data, error } = await supabaseAdmin
      .from('agent_roles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

/**
 * Creates a new agent role.
 * @param {object} role - Agent role data to insert
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createAgentRole(role) {
  try {
    const { data, error } = await supabaseAdmin
      .from('agent_roles')
      .insert(role)
      .select()
      .single()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}

/**
 * Updates an existing agent role by ID.
 * @param {string} id - Agent role UUID
 * @param {object} updates - Partial agent role fields to update
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateAgentRole(id, updates) {
  try {
    const { data, error } = await supabaseAdmin
      .from('agent_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: { message: error.message, code: error.code } }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message, code: 'UNEXPECTED_ERROR' } }
  }
}
