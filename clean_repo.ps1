Write-Host "Cleaning up repository - removing unnecessary documentation files..."

$filesToDelete = @(
    "DEPLOYMENT_GUIDE.md",
    "FINAL_SUMMARY.md",
    "IMPLEMENTATION_GUIDE.md",
    "INTERVIEW_PREP.md",
    "PROJECT_GUIDE.md",
    "QUICKSTART.md",
    "QUICK_START.md",
    "README_SUBMISSION.md",
    "REALTIME.md",
    "SUBMISSION_CHECKLIST.md"
)

foreach ($file in $filesToDelete) {
    $path = Join-Path -Path $PSScriptRoot -ChildPath $file
    if (Test-Path $path) {
        Remove-Item -Path $path -Force
        Write-Host "Removed $file"
    } else {
        Write-Host "$file not found - skipping"
    }
}

Write-Host "Cleanup complete."
