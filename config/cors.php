    <?php

return [
    'paths' => ['api/*', 'admin/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [
        'http://localhost:8000',
        'https://team.manpromanagement.com',
        'https://phplaravel-719501-5268927.cloudwaysapps.com'        
    ],
    'allowed_headers' => ['Authorization', 'Content-Type', 'X-Requested-With'],
    // 'allowed_methods' => ['*'],  
    // 'allowed_origins' => ['*'],  
    // 'allowed_headers' => ['*'],  
    'supports_credentials' => true,
];