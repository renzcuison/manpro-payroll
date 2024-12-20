<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Corporate extends Model
{
    use HasFactory;

    protected $table = 'tbl_corporates';

    public $timestamps = false;
    
    const CREATED_AT = 'date_created';

    protected $guarded = [];

    public function facilities()
    {
        $facilities = $this->hasMany(Facility::class)->with('clients')->where('is_removed', 0);
        return $facilities;
    }
}