import mongoose from 'mongoose';

const systemRequirementsSchema = new mongoose.Schema(
  {
    minimum: {
      os: { type: String, default: '' },
      processor: { type: String, default: '' },
      memory: { type: String, default: '' },
      graphics: { type: String, default: '' },
      storage: { type: String, default: '' },
    },
    recommended: {
      os: { type: String, default: '' },
      processor: { type: String, default: '' },
      memory: { type: String, default: '' },
      graphics: { type: String, default: '' },
      storage: { type: String, default: '' },
    },
  },
  { _id: false }
);

const downloadOptionSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      default: '',
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    rawgId: { type: Number, unique: true, sparse: true, index: true },
    genre: {
      type: [String],
      default: [],
    },
    developer: {
      type: String,
      trim: true,
      default: '',
    },
    platform: {
      type: [String],
      default: [],
    },
    gameSize: {
      type: String,
      trim: true,
      default: '',
    },
    releasedBy: {
      type: String,
      trim: true,
      default: '',
    },
    version: {
      type: String,
      trim: true,
      default: '',
    },
    releaseYear: {
      type: Number,
    },
    coverImage: {
      type: String, // Main/hero cover URL
      trim: true,
      default: '',
    },
    images: {
      type: [String], // Array of additional gallery/screenshot URLs
      default: [],
    },
    backgroundImage: { type: String, trim: true, default: '' },
    screenshots: { type: [String], default: [] },
    genres: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    publisher: { type: String, trim: true, default: '' },
    platforms: { type: [String], default: [] },
    releaseDate: { type: Date, default: null },
    rating: { type: Number, default: null },
    metacritic: { type: Number, default: null },
    playtime: { type: Number, default: null },
    storeLinks: [{ name: { type: String, default: '' }, url: { type: String, default: '' } }],
    lastSyncedAt: { type: Date, default: null, index: true },
    systemRequirements: {
      type: systemRequirementsSchema,
      default: () => ({}),
    },
    downloads: {
      type: [downloadOptionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from title before validation
gameSchema.pre('validate', function () {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
