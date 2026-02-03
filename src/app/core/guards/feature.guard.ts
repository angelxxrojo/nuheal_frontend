import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { SubscriptionService } from '../../features/nurse/services/subscription.service';
import { FeatureCode } from '../../models/plan.model';

export const featureGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);

  const requiredFeature = route.data['feature'] as FeatureCode;

  if (!requiredFeature) {
    return true;
  }

  return subscriptionService.checkFeature(requiredFeature).pipe(
    map(response => {
      if (response.has_feature && response.within_limit) {
        return true;
      }

      router.navigate(['/nurse/configuracion/plan'], {
        queryParams: { feature: requiredFeature }
      });
      return false;
    }),
    catchError(() => {
      router.navigate(['/nurse/dashboard']);
      return of(false);
    })
  );
};
