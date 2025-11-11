# Inset Component Usage Guide

The inset component allows you to add clickable images or tables to your blog posts that expand to full screen when clicked.

## Basic Usage

### With an Image

```liquid
{% include inset.html 
   content="<img src='/assets/images/example.jpg' alt='Example image'>" 
   caption="This is an example caption" 
%}
```

### With a Table

```liquid
{% include inset.html 
   content="<table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Data 1</td><td>Data 2</td></tr></table>" 
   caption="Example table caption" 
%}
```

### Without a Caption

```liquid
{% include inset.html 
   content="<img src='/assets/images/example.jpg' alt='Example image'>" 
%}
```

## Features

- Click any inset to expand it to almost full screen
- Close button (X) appears in the top left corner
- Click outside the modal or press Escape to close
- Supports both images and tables
- Optional captions for both inset and expanded views
- Responsive design that works on all screen sizes

## Example: 1EdTech Initiatives Table

Here's how you could use it for your 1EdTech initiatives post:

```liquid
{% include inset.html 
   content="<table>
     <thead>
       <tr>
         <th>Initiative</th>
         <th>Description</th>
         <th>Status</th>
       </tr>
     </thead>
     <tbody>
       <tr>
         <td>Initiative 1</td>
         <td>Description here</td>
         <td>Active</td>
       </tr>
       <!-- More rows... -->
     </tbody>
   </table>" 
   caption="1EdTech Initiatives Summary" 
%}
```

