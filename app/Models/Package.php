<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Package extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * The features that belong to the package.
     */
    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class);
    }
}