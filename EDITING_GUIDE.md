# Editing Guide: Environmental Futures Archive

This guide explains how a non-developer can maintain and update the Environmental Futures Archive.

---

## 1. Adding a Story from the Template

When adding a story to the collection:

1. **Required Fields**:
   - **Title**: Maximum 120 characters, plain title case (e.g. *The Seed Vault at Solstice*).
   - **Author Name**: Author's chosen name, or "Anonymous".
   - **Institution**: The undergraduate's university or college.
   - **Story Text**: The full text (under 1000 words). Paragraph breaks should be double line breaks (`\n\n`).
   - **Short Bio**: Optional, maximum 60 words.
2. **Formatting within the story**:
   - **Paragraphs**: Keep 1 line between paragraphs.
   - **Scene breaks**: Insert a line with three dashes (`---`) to create a disciplined 3rem rule.
   - **Block quotes**: Precede lines with `>` to format quotations.
3. **In the Static Site / Script**:
   - Stories submitted through the [`submit.html`](file:///c:/Soham/website/submit.html) form are sent to the Vercel API and immediately added to the public archive. The site does not include bundled sample stories.
4. **In WordPress**:
   - Go to **Stories > Add New**.
   - Paste the title, author custom field, institution, and bio.
   - Insert the story text into standard paragraph blocks.

---

## 2. Adding Open-Access Art to a Story

If a story is paired with featured artwork:

1. **Verify Licensing**:
   - Ensure the artwork is from an open-access museum collection (Smithsonian Open Access, Met Open Access, Art Institute of Chicago, National Gallery of Art, Cleveland Museum of Art, or Rijksmuseum).
   - Confirm it is designated **CC0** or **Public Domain**.
2. **Credit Line Format**:
   - Every artwork must display its proper citation beneath the image:
     `[Artist Name], [Artwork Title], [Year]. [Museum/Institution], [Bequest/Accession Number].`
3. **Log Entry**:
   - Record the image file, source URL, license type, and date checked.

---

## 3. Editing Existing Pages

- **Home (`index.html`)**: Contains the intro paragraph and buttons. To change the introductory text or prompt, edit the text inside the `.text-column` div.
- **About (`about.html`)**: Contains the project description and curator/developer credit lines.
- **Stories (`stories.html`)**: Renders the archive with 20 items per page. The empty state ("The first stories will appear here soon...") is configured in `#stories-empty-state`.
- **Submit (`submit.html`)**: Contains the eligibility guidance, policy statements, and form fields.
- **Admin (`admin.html`)**: Sign in with the configured admin credentials to review, delete, or download the private ZIP archive.

---

## 4. Replacing the Homepage Painting

1. Source a high-resolution, CC0 public-domain image.
2. Crop gently without distortion and optimize to approximately 1600px wide, under 250 KB (JPEG or WebP).
3. Replace `sun-dove-1943.jpg` in the root folder.
4. Update the `<figcaption>` in `index.html` with the new artist, title, year, and museum accession line.
5. Update the `alt="..."` attribute to accurately describe what the image depicts.
