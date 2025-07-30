import { PassportStatic } from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../entities/User';
import { SqlEntityManager } from '@mikro-orm/postgresql'; // ← Thay đổi import

interface JwtPayload {
  id: number;
  // Mở rộng nếu cần thêm: email?: string; role?: string;
}

export function configurePassport(passport: PassportStatic, em: SqlEntityManager) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('❌ JWT_SECRET is not defined in environment variables');
  }

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtSecret,
      },
      async (jwtPayload: JwtPayload, done) => {
        try {
          console.log('🔐 JWT payload:', jwtPayload); // Debug - có thể xóa sau
          const user = await em.findOne(User, { id: jwtPayload.id });
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}