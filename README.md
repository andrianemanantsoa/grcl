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

## Kubernetes Deployment (GKE / Minikube)

### 1. Build and Push Docker Images
Change `YOUR_DOCKER_USER` inside K8s deployment manifests before proceeding.

```sh
# Build images
docker build -t YOUR_DOCKER_USER/crowdauth-auth:latest ./services/auth-service
docker build -t YOUR_DOCKER_USER/crowdauth-frontend:latest ./services/frontend

# Push to Docker Hub
docker push YOUR_DOCKER_USER/crowdauth-auth:latest
docker push YOUR_DOCKER_USER/crowdauth-frontend:latest
```

### 2. Deploy to Kubernetes

Deploy the required resources:

```sh
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongodb/
kubectl apply -f k8s/auth-service/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress/
```

### 3. Verify Deployment
Check the status of your pods and services:
```sh
kubectl get pods -n crowdauth
kubectl get svc -n crowdauth
kubectl get ingress -n crowdauth
```

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
Use the helper Python script (wrapper around `ab`) to generate mass requests to the authentication service logic:
```sh
# Replace EXTERNAL-IP with your ingress/loadbalancer IP
python3 scripts/stress_backend.py --base-url http://EXTERNAL-IP
```

Or run Apache Benchmark directly:
```sh
# Wait for the service to be ready and substitute EXTERNAL-IP with your ingress/loadbalancer IP
ab -n 50000 -c 1000 http://EXTERNAL-IP/api/auth/health
```

As the simulated load climbs and CPU load surpasses the 70% target, the HPA will automatically provision new `auth-service` pods up to the max boundary (10 replicas), validating your system's scalability.
# grcl
