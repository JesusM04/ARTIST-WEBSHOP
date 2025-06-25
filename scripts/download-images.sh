#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Download images
curl -o public/campus.jpg "https://images.unsplash.com/photo-1562774053-701939374585?w=1600"
curl -o public/especializaciones.jpg "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800"
curl -o public/maestrias.jpg "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800"
curl -o public/doctorados.jpg "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"
curl -o public/extension.jpg "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800" 