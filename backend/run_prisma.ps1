$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            if ($value -match "^['`"](.*)['`"]$") {
                $value = $matches[1]
            }
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Set env: $key"
        }
    }
}
else {
    Write-Host ".env not found!"
    exit 1
}

# Run args
$cmd = $args[0]
$cmdArgs = $args[1..($args.Length - 1)]

Write-Host "Running: $cmd $cmdArgs"
& $cmd $cmdArgs
