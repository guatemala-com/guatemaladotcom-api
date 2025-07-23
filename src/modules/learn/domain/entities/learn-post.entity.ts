/**
 * Learn Post Entity
 *
 * Represents a learning post for read-only operations.
 * This is a domain entity that encapsulates the business logic for learn posts.
 */
import {
  LearnPostImage,
  LearnPostLocationGeopoint,
  LearnPostCategory,
  LearnPostAuthor,
  LearnPostSponsor,
  LearnPostSeo,
} from '../types/learn-post.types';

export class LearnPost {
  constructor(
    public readonly id: number,
    public readonly url: string,
    public readonly title: string,
    public readonly excerpt: string,
    public readonly date: string,
    public readonly images: LearnPostImage[],
    public readonly locationGeopoint: LearnPostLocationGeopoint | null,
    public readonly content: string,
    public readonly categories: LearnPostCategory[],
    public readonly author: LearnPostAuthor,
    public readonly keywords: string[],
    public readonly isSponsored: number,
    public readonly sponsor: LearnPostSponsor,
    public readonly seo: LearnPostSeo,
  ) {}

  /**
   * Get learn post information for API responses
   */
  toResponse() {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      excerpt: this.excerpt,
      date: this.date,
      images: this.images,
      location_geopoint: this.locationGeopoint,
      content: this.content,
      categories: this.categories,
      author: this.author,
      keywords: this.keywords,
      is_sponsored: this.isSponsored,
      sponsor_name: this.sponsor.name,
      sponsor_image_url: this.sponsor.image_url,
      sponsor_image: this.sponsor.image,
      sponsor_image_sidebar_url: this.sponsor.image_sidebar_url,
      sponsor_image_sidebar: this.sponsor.image_sidebar,
      sponsor_image_content_url: this.sponsor.image_content_url,
      sponsor_image_content: this.sponsor.image_content,
      sponsor_extra_data: this.sponsor.extra_data,
      seo: this.seo,
      audionote_url: `https://audionotas.guatemala.com/aprende/${this.id}.mp3`,
    };
  }

  /**
   * Create a LearnPost from database data
   */
  static fromDatabase(data: {
    id: number;
    url: string;
    title: string;
    excerpt: string;
    date: string;
    images: LearnPostImage[];
    locationGeopoint: LearnPostLocationGeopoint | null;
    content: string;
    categories: LearnPostCategory[];
    author: LearnPostAuthor;
    keywords: string[];
    isSponsored: number;
    sponsor: LearnPostSponsor;
    seo: LearnPostSeo;
  }): LearnPost {
    return new LearnPost(
      data.id,
      data.url,
      data.title,
      data.excerpt,
      data.date,
      data.images,
      data.locationGeopoint,
      data.content,
      data.categories,
      data.author,
      data.keywords,
      data.isSponsored,
      data.sponsor,
      data.seo,
    );
  }
}
