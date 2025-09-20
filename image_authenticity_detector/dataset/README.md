# Dataset Structure

This directory contains the training dataset for the image authenticity detection model.

## Directory Structure

```
dataset/
├── real/
│   ├── real_edited/          # Real images that have been edited/manipulated
│   └── real_unedited/        # Original, unedited real images
└── fake/                     # AI-generated or synthetic images
```

## Dataset Requirements

### Real Images (`real/`)
- **real_unedited/**: Original photographs taken with cameras, smartphones, etc.
  - Should be high-quality, authentic images
  - No post-processing beyond basic camera adjustments
  - Diverse subjects: people, landscapes, objects, etc.

- **real_edited/**: Real photographs that have been modified
  - Photoshopped images
  - Images with filters applied
  - Color-corrected or enhanced images
  - Images with objects removed or added
  - Composite images made from real photos

### Fake Images (`fake/`)
- AI-generated images from tools like:
  - DALL-E, Midjourney, Stable Diffusion
  - GANs (Generative Adversarial Networks)
  - Other AI image generation tools
- Computer-generated graphics
- Synthetic images

## Data Collection Guidelines

1. **Balance**: Maintain roughly equal numbers of images in each category
2. **Quality**: Use high-resolution images (minimum 224x224 pixels)
3. **Diversity**: Include various subjects, lighting conditions, and styles
4. **Formats**: Supported formats are JPG, PNG, WEBP
5. **Size**: Each image should be under 10MB

## Recommended Dataset Size

For effective training:
- **Minimum**: 1,000 images per category (3,000 total)
- **Recommended**: 5,000+ images per category (15,000+ total)
- **Professional**: 10,000+ images per category (30,000+ total)

## Sample Data

The notebook includes code to generate sample synthetic data for testing purposes. Replace this with real data for production use.

## Data Sources

Consider these sources for building your dataset:

### Real Images
- Personal photo collections
- Stock photo websites (with proper licensing)
- Open datasets like COCO, ImageNet
- Social media (with permission)

### Fake Images
- AI-generated image datasets
- Computer graphics repositories
- Generated images from AI tools

### Edited Images
- Before/after photo editing examples
- Photoshop tutorials and examples
- Image manipulation datasets

## Legal Considerations

- Ensure you have rights to use all images
- Respect copyright and privacy laws
- Consider using Creative Commons licensed images
- For commercial use, verify licensing terms

## Data Preprocessing

The model automatically handles:
- Resizing to 224x224 pixels
- Normalization (pixel values 0-1)
- Color space conversion (RGB)

## Adding New Data

1. Place images in the appropriate subdirectories
2. Ensure proper file extensions (.jpg, .png, .webp)
3. Run the training notebook to retrain the model
4. Validate model performance on test data

## Quality Control

Before adding images to the dataset:
- Verify image authenticity and category
- Check for corruption or artifacts
- Ensure diverse representation
- Remove duplicates or near-duplicates