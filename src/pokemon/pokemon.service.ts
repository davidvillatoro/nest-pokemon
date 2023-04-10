import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly PokemonModel: Model<Pokemon>
  ){}


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.PokemonModel.create( createPokemonDto);
      return pokemon;
      
    } catch (error) {
      if (error.code === 11000) {
         throw new BadRequestException('Pokemon ya existe en la bbdd' + `${JSON.stringify(error.keyValue)}`);
      }
      console.log(error);
      throw new InternalServerErrorException(`Can't create pokemon checker log server`);
      
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon:Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.PokemonModel.findOne({ no: term })
    }

    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.PokemonModel.findById( term);
    }

    if (!pokemon) {
       pokemon = await this.PokemonModel.findOne({ name: term.toLocaleLowerCase().trim()})
    }


    if(!pokemon) throw new NotFoundException(`Pokemon con id, o nombre  "${term}" no se encuentra`)

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    if (updatePokemonDto.name)  updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    
    try {
      await pokemon.updateOne( updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto}
      
    } catch (error) {
      this.ErrorDuplicado(error);
    }
  }



  async remove(id: string) {
    //const pokemon = await this.findOne( id );
    const {deletedCount} = await this.PokemonModel.deleteOne({_id: id});
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }
    return 'se elimino correctamente';

  }




  //metodo para no hacer la validacion otraves del post en el patch
  private ErrorDuplicado(error: any){
      if (error.code === 11000) {
         throw new BadRequestException('Pokemon ya existe en la bbdd' + `${JSON.stringify(error.keyValue)}`);
      }
      console.log(error);
      throw new InternalServerErrorException(`Can't create pokemon checker log server`);
  };


}
