<?php

return [
    'paths' => ['api/*', 'admin/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://team.manpromanagement.com',
        'https://phplaravel-719501-5268927.cloudwaysapps.com'
    ],
    'allowed_headers' => ['Authorization', 'Content-Type', 'X-Requested-With'],
    'supports_credentials' => true,
];