# Wandermap

Wandermap is an interactive React + Vite application that lets you highlight countries on a world map. Track places you’ve visited (or plan to visit) with customizable colors, view live statistics, and export the current map as a PNG image.

## Features
- **Interactive world map** – click countries to toggle their highlighted state
- **Flexible color picker** – choose any color and instantly apply it to selected countries
- **Country search** – quickly find and toggle countries via autocomplete search
- **Live stats** – see how many countries you’ve marked out of the total
- **Export as image** – capture the current map view as a PNG using `html2canvas`

## Tech Stack
- React + TypeScript
- Vite (build & dev tooling)
- Tailwind CSS
- lucide-react (icons)
- html2canvas (image export)

## Getting Started
```sh
git clone https://github.com/RenNogiwa/wandermap.git
cd wandermap
npm install
npm run dev
```
Open `http://localhost:5173` to start developing.  
Use `npm run build` for production builds and `npm run preview` to test the build locally.

## How to Use
1. Click on countries in the map to mark them as visited.
2. See the highlighted list on the left; remove entries from the tag list if needed.
3. Adjust the highlight color using the color picker — all selected countries update instantly.
4. Press **Save as Image** to export the map as a PNG snapshot.

Perfect for keeping track of your travels or planning your future trips!
