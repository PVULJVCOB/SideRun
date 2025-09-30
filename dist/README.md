SideRun distribution (standalone)

Included files
- siderun.css — standalone companion stylesheet
- siderun.js — standalone runtime JavaScript

Usage
1) Copy the files into your project (or reference them from a static server):

   <link rel="stylesheet" href="/path/to/dist/siderun.css" />
   <script defer src="/path/to/dist/siderun.js"></script>

2) Markup
   Add the SideRun host container to your HTML. Example:

   <div id="siderun" class="sr-container glass-bg">
     <div class="site-nav__stroke siderun"></div>
     <!-- content -->
   </div>

3) Initialize the runtime (optional)
   The runtime exposes a simple API. Example:

   <script>
   document.addEventListener('DOMContentLoaded', function(){
     if (window.SideRun && document.getElementById('siderun')) {
       SideRun.init(document.getElementById('siderun'), {
         radius: 12,
         tail: 14,
         margin: 11
       });
     }
   });
   </script>

Tokens & customization
The visual aspects are controlled via CSS custom properties. Use the tokens documented in `styles/siderun.css` (or in this distribution file) to customize colors, stroke widths, blur amount, and scale.

License
MIT — see root LICENSE file for details.
Copyright (c) 2025 Cedric Seidel
