$body = @{
    name = "Ramesh Patil"
    phone = "9823246538"
} | ConvertTo-Json

Write-Host "=== Test 1: Valid submission ==="
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/submit' -Method Post -ContentType 'application/json' -Body $body
    $response | ConvertTo-Json
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.ReadToEnd()
}

Write-Host ""
Write-Host "=== Test 2: Invalid submission (empty body) ==="
try {
    $response2 = Invoke-RestMethod -Uri 'http://localhost:3000/api/submit' -Method Post -ContentType 'application/json' -Body '{}'
    $response2 | ConvertTo-Json
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader2 = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader2.ReadToEnd()
}

Write-Host ""
Write-Host "=== Test 3: Invalid phone ==="
$body3 = @{
    name = "Test"
    phone = "123"
} | ConvertTo-Json
try {
    $response3 = Invoke-RestMethod -Uri 'http://localhost:3000/api/submit' -Method Post -ContentType 'application/json' -Body $body3
    $response3 | ConvertTo-Json
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader3 = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader3.ReadToEnd()
}
