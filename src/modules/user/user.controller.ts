import { Controller, Post, HttpCode, HttpStatus, Body, Get, Query, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommonErrorResponse } from 'src/common/serializers/error.serializer';
import { SWAGGER_API_TAGS } from 'src/common/constants/common.constant';

/**
 * Controller for user management operations.
 */
@ApiTags(SWAGGER_API_TAGS.USER)
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
    constructor(private userService: UserService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Register a new Manager or Employee' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, type: CommonErrorResponse, description: 'Invalid input or duplicate username/email' })
    @ApiResponse({ status: 401, type: CommonErrorResponse, description: 'Unauthorized' })
    async registerUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.registerUser(createUserDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Retrieve all users' })
    @ApiResponse({ status: 200, description: 'List of all users' })
    @ApiResponse({ status: 401, type: CommonErrorResponse, description: 'Unauthorized' })
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    @Get('id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Retrieve a user by ID' })
    @ApiQuery({ name: 'id', type: Number, description: 'User ID', required: true })
    @ApiResponse({ status: 200, description: 'User details' })
    @ApiResponse({ status: 404, type: CommonErrorResponse, description: 'User not found' })
    @ApiResponse({ status: 401, type: CommonErrorResponse, description: 'Unauthorized' })
    async getUserById(@Query('id') id: number) {
        return this.userService.getUserById(id);
    }
}
