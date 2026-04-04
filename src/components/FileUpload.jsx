import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024 // 100 MB

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatMaxSize(bytes) {
  return `${Math.round(bytes / (1024 * 1024))} MB`
}

export default function FileUpload({ projectId, maxSize = DEFAULT_MAX_SIZE, onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const validateFile = useCallback((file) => {
    if (!file) return 'No file selected'
    if (file.size > maxSize) {
      return `File size (${formatFileSize(file.size)}) exceeds the ${formatMaxSize(maxSize)} limit`
    }
    return null
  }, [maxSize])

  const uploadFile = useCallback(async (file) => {
    if (!projectId) {
      setError('No project ID provided')
      return
    }

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)
    setSelectedFile(file)

    const filePath = `${projectId}/${Date.now()}-${file.name}`

    // Simulate progress since supabase-js doesn't expose upload progress natively
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file)

    clearInterval(progressInterval)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      setProgress(0)
      setSelectedFile(null)
      return
    }

    setProgress(100)

    // Get signed URL (15-min expiry)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('project-files')
      .createSignedUrl(filePath, 900)

    setUploading(false)

    if (urlError) {
      setError(urlError.message)
      setSelectedFile(null)
      return
    }

    const result = {
      fileName: file.name,
      fileSize: file.size,
      filePath,
      signedUrl: urlData?.signedUrl || null,
    }

    setSelectedFile(null)
    setProgress(0)

    if (onUploadComplete) {
      onUploadComplete(result)
    }
  }, [projectId, maxSize, validateFile, onUploadComplete])

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    const file = e.dataTransfer?.files?.[0]
    if (file) uploadFile(file)
  }

  const handleFileSelect = (e) => {
    setError(null)
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClick = () => {
    if (!uploading) fileInputRef.current?.click()
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="file-upload">
      <div
        className={`file-upload-zone${dragActive ? ' file-upload-zone--active' : ''}${uploading ? ' file-upload-zone--uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Upload file, maximum size ${formatMaxSize(maxSize)}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-upload-input"
          onChange={handleFileSelect}
          tabIndex={-1}
          aria-hidden="true"
        />

        {uploading && selectedFile ? (
          <div className="file-upload-progress">
            <i className="fa-solid fa-spinner fa-spin file-upload-icon" />
            <span className="file-upload-filename">{selectedFile.name}</span>
            <div className="file-upload-bar">
              <div
                className="file-upload-bar-fill"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="file-upload-percent">{progress}%</span>
          </div>
        ) : (
          <div className="file-upload-prompt">
            <i className="fa-solid fa-cloud-arrow-up file-upload-icon" />
            <span className="file-upload-text">
              Drag &amp; drop a file here, or click to browse
            </span>
            <span className="file-upload-hint">
              Max file size: {formatMaxSize(maxSize)}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="file-upload-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
