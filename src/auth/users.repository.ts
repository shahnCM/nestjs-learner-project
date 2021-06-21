import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { User } from "./user.entity";
import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UsersRepository extends Repository<User> { 
    /* <User> is the generic type of a class */
    async createUser(authCreadentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCreadentialsDto;

        /* Hash the password then store it in database */
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = this.create({ username, password: hashedPassword });
        
        try {
            await this.save(user);
        } catch(error) {
            if(error.code === '23505') { 
                /* 23505 is the Code for duplicate username error from pgsql */
                throw new ConflictException('Username already exists!');
            } else {
                throw new InternalServerErrorException()
            }
            console.log(error.code)
        }
        
    }
}