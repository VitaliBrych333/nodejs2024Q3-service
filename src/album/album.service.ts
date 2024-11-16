import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateAlbumDto } from './dto/album.dto';
import { DatabaseService } from '../database/database.service';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAlbums() {
    const album = await this.databaseService.album.findMany();
    return album;
  }

  async createAlbum(albumDto: CreateAlbumDto) {
    this.validateAlbumCreate(albumDto);

    const validatedArtistId =
      albumDto.artistId &&
      (await this.databaseService.artist.findUnique({
        where: { id: albumDto.artistId },
      }))
        ? albumDto.artistId
        : null;

    const albumData = {
      id: uuidv4(),
      name: albumDto.name,
      year: albumDto.year,
      artistId: validatedArtistId,
    };

    return this.databaseService.album.create({ data: albumData });
  }

  async getAlbumById(id: string) {
    const album = await this.databaseService.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException('This album is not exist');
    }

    return album;
  }

  async updateAlbumById(id: string, updateAlbumDto: UpdateAlbumDto) {
    this.validateAlbumCreate(updateAlbumDto);

    const album = await this.databaseService.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException('This album is not exist');
    }

    let validatedArtistId = null;
    if (updateAlbumDto.artistId) {
      const artist = await this.databaseService.artist.findUnique({
        where: { id: updateAlbumDto.artistId },
      });

      if (artist) {
        validatedArtistId = updateAlbumDto.artistId;
      }
    }

    const updatedAlbum = await this.databaseService.album.update({
      where: { id },
      data: {
        name: updateAlbumDto.name || album.name,
        year: updateAlbumDto.year || album.year,
        artistId: validatedArtistId,
      },
    });

    return updatedAlbum;
  }

  async deleteAlbumById(id: string) {
    const album = await this.databaseService.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException('This album is not exist');
    }

    await this.databaseService.track.updateMany({
      where: { albumId: id },
      data: { albumId: null },
    });

    return this.databaseService.album.delete({ where: { id } });
  }

  private validateAlbumCreate(albumDto: CreateAlbumDto) {
    const { name, artistId, year } = albumDto;

    if (!albumDto || typeof name !== 'string' || typeof year !== 'number') {
      throw new BadRequestException('New album invalid'); //400
    }

    if (typeof artistId !== 'string' && artistId !== null) {
      throw new BadRequestException('Artist for new album invalid');
    }
  }
}
