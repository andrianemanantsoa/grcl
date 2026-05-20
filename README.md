# CrowdAuth

A modern web application built using the MERN stack (MongoDB, Express.js, React, Node.js), demonstrating scalable deployment on Kubernetes with Horizontal Pod Autoscaling (HPA). Designed specifically to validate Kubernetes scaling behavior under heavy traffic scenarios utilizing Apache Benchmark.

## Features
- **Frontend:** React 18, Vite, Axios, React Router v6.
- **Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT basic authentication.
- **Orchestration:** Docker, Docker Compose, Kubernetes.
- **Load Generation Support:** Readily deployable structure to test scaling.

## Local Installation (Docker Compose)

1. Navigate to the project root and start the application:
```sh
docker-compose up -d --build
```
2. Access the frontend at `http://localhost:3000`
3. The auth service handles requests at `http://localhost:5000`

## Kubernetes Deployment on Microsoft Azure (AKS)

### 1. Create Azure resources (AKS + ACR)
Set variables then create a resource group, container registry, and AKS cluster.

```sh
export RESOURCE_GROUP=grcl-rg
export LOCATION=westeurope
export AKS_CLUSTER=grcl-aks
export ACR_NAME=YOUR_UNIQUE_ACR_NAME # must be globally unique

az group create --name $RESOURCE_GROUP --location $LOCATION
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic
az aks create --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER --node-count 2 --enable-managed-identity --attach-acr $ACR_NAME
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER
```

### 2. Install NGINX ingress controller

```sh
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

### 3. Build and push images to ACR

```sh
az acr login --name $ACR_NAME
docker build -t $ACR_NAME.azurecr.io/crowdauth-auth:latest ./services/auth-service
docker build -t $ACR_NAME.azurecr.io/crowdauth-frontend:latest ./services/frontend
docker push $ACR_NAME.azurecr.io/crowdauth-auth:latest
docker push $ACR_NAME.azurecr.io/crowdauth-frontend:latest
```

### 4. Prepare Kubernetes manifests
1. In `k8s/auth-service/auth-deployment.yaml`, replace `YOUR_ACR_NAME` with your actual ACR name.
2. In `k8s/frontend/frontend-deployment.yaml`, replace `YOUR_ACR_NAME` with your actual ACR name.
3. In `k8s/auth-service/auth-secret.yaml`, replace `REPLACE_WITH_A_LONG_RANDOM_SECRET_VALUE` with your real JWT secret value (or use Azure Key Vault + CSI driver in production).

### 5. Deploy to AKS

```sh
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongodb/
kubectl apply -f k8s/auth-service/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress/
```

### 6. Verify deployment

```sh
kubectl get pods -n crowdauth
kubectl get svc -n crowdauth
kubectl get ingress -n crowdauth
kubectl get hpa -n crowdauth
```

Get external IP and test frontend/API:

```sh
kubectl get svc -n ingress-nginx
curl http://YOUR_EXTERNAL_IP/
curl http://YOUR_EXTERNAL_IP/api/auth/health
```

### 7. Production hardening (recommended)
- Add TLS certificates (for example with cert-manager + Let's Encrypt).
- Move secret creation to CI/CD or Key Vault + CSI driver.
- Keep HPA enabled and tune thresholds from real traffic.
- Automate build/push/deploy with GitHub Actions and Azure login (OIDC).

## Load Testing and HPA Autoscaling

Observe the Horizontal Pod Autoscaler adapting to load effectively:

### Start watching the HPA behavior
In a dedicated terminal, run:
```sh
kubectl get hpa -n crowdauth -w
```
Also, you can watch the pods spinning up:
```sh
kubectl get pods -n crowdauth -w
```

### Produce Heavy Traffic (Apache Benchmark)
Use `ab` to generate mass requests to the authentication service logic:
```sh
# Wait for the service to be ready and substitute EXTERNAL-IP with your ingress/loadbalancer IP
ab -n 50000 -c 1000 http://EXTERNAL-IP/api/auth/health
```

As the simulated load climbs and CPU load surpasses the 70% target, the HPA will automatically provision new `auth-service` pods up to the max boundary (10 replicas), validating your system's scalability.
