#include <iostream>
#include "/Volumes/san256/users_for_mac_system_macPro/jeannerat/mnova_dev/mnova/3rdParty/eigen3/Eigen/Eigen"
 #include <complex>
#include <cmath>
using namespace std;
using namespace Eigen;
// clang++ -fdiagnostics-color=always ../src/testMatrix.cpp ;
// Inofr:
// https://cppsecrets.com/users/141731151079711010097114105641121044610510511611446979946105110/C00-EigenLinear-algebra-and-decompositions.php

/*
class MyVectorType : public Eigen::MatrixXcd
{
public:
    MyVectorType(void):Eigen::MatrixXcd() {}
 
    // This constructor allows you to construct MyVectorType from Eigen expressions
    template<typename OtherDerived>
    MyVectorType(const Eigen::MatrixBase<OtherDerived>& other)
        : Eigen::VectorXd(other)
    { }
 
    // This method allows you to assign Eigen expressions to MyVectorType
    template<typename OtherDerived>
    MyVectorType& newKron(const Eigen::MatrixBase <OtherDerived>& B)
    {
			MatrixXcd C = MatrixXcd::Zero(this.rows() * B.rows(), this.cols() * B.cols());

        return C;
    }
};
*/
void kroneker(const MatrixXcd &A, const MatrixXcd &B, MatrixXcd &C) {
	for (int index1 = 0; index1 < A.rows(); index1++) {
		for (int index2= 0; index2 < A.cols(); index2++)
		{
		    C.block(index1 * B.rows(), index2 * B.cols(), B.rows(), B.cols()) = A(index1, index2) * B;
		}
	}
}


MatrixXcd newKroneker(const MatrixXcd &A, const MatrixXcd &B) {
	MatrixXcd C = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	for (int index1 = 0; index1 < A.rows(); index1++) {
		for (int index2= 0; index2 < A.cols(); index2++)
		{
		    C.block(index1 * B.rows(), index2 * B.cols(), B.rows(), B.cols()) = A(index1, index2) * B;
		}
	}
	return C;
}


int main()
{
	{
   Matrix2f A;
   A << 1, 2, 2, 3;
   cout << "Here is the matrix A:\n" << A << endl;
   SelfAdjointEigenSolver<Matrix2f> eigensolver(A);
   if (eigensolver.info() != Success) abort();
   cout << "The eigenvalues of A are:\n" << eigensolver.eigenvalues() << endl;
   cout << "Here's a matrix whose columns are eigenvectors of A \n"
        << "corresponding to these eigenvalues:\n"
        << eigensolver.eigenvectors() << endl;

   cout << "The 111" << endl << (eigensolver.eigenvectors().transpose() * A) << endl;
   cout << "The 11222are:" << endl << (A * eigensolver.eigenvectors().transpose())  << endl;
 cout << "The 111" << endl << (eigensolver.eigenvectors().inverse() * A) << endl;
   cout << "The 11222are:" << endl << (A * eigensolver.eigenvectors().inverse())  << endl;

}

{
	Matrix3f A;
   A << 1, 2, 5,
        2, 1, 4,
        3, 0, 3;
   cout << "Here is the matrix A:\n" << A << endl;
   FullPivLU<Matrix3f> lu_decomp(A);
   cout << "The rank of A is " << lu_decomp.rank() << endl;
   cout << "Here is a matrix whose columns form a basis of the null-space of A:\n"
        << lu_decomp.kernel() << endl;
   cout << "Here is a matrix whose columns form a basis of the column-space of A:\n"
        << lu_decomp.image(A) << endl; // yes, have to pass the original A
{   Matrix2d A;
   A << 2, 1,
        2, 0.9999999999;
   FullPivLU<Matrix2d> lu(A);
   cout << "By default, the rank of A is found to be " << lu.rank() << endl;
   lu.setThreshold(1e-5);
   cout << "With threshold 1e-5, the rank of A is found to be " << lu.rank() << endl;
   }

}


{
Matrix2f A;
   A << 1, 0, 0, 1;
Matrix2f B;
   B << 1, 0, 0, -1;


  cout << "Square of test matrix is /n" << A*B <<endl;

/*
MatrixXf I = MatrixXf::Identity(2,2);
MatrixXf X = MatrixXf::Random(8,8);
//MatrixXf P = kroneckerProduct(I,X);

Matrix4f I4 = Matrix4f::Identity();
MatrixXf P2(I4.rows() * X.rows(), I4.cols() * X.cols()); // size known at compilation time
P2.setZero();

for (int i = 0; i < I4.RowsAtCompileTime; i++)
{
    P2.block(i*X.rows(), i*X.cols(), X.rows(), X.cols()) = I4(i, i) * X;
	    cout << "kroneckerProduct is /n" << P2 <<endl;

}

*/
}



{
	const std::complex<double> complex_i(0.0, 1.0);
	const std::complex<double> complex_mi(0.0, -1.0);
	const std::complex<double> complex_0(0.0, 0.0);
	const std::complex<double> complex_1(1.0, 0.0);
	const std::complex<double> complex_m1(-1.0, 0.0);
	MatrixXcd I2 = MatrixXcd::Zero(2, 2);
	const double factor = 1.0;
	I2(0,0) =  complex_1 / 2.0 ;
	I2(1,1) =  complex_1 / 2.0 ;
//	std::cout << "I2 is " << endl << I2 << std::endl;
	 
	MatrixXcd Iz = MatrixXcd::Zero(2, 2);
	Iz(0,0) =  complex_1 / factor ;
	Iz(1,1) =  complex_m1 / factor ;

	MatrixXcd Ix = MatrixXcd::Zero(2, 2);
	Ix(0,1) =  complex_1 / factor ;
	Ix(1,0) =  complex_1 / factor ;  
//	 std::cout << "Ix is " << endl << Ix << std::endl;

	MatrixXcd Iy = MatrixXcd::Zero(2, 2);
	Iy(0,1) =  complex_mi / factor ;
	Iy(1,0) =  complex_i  / factor ;

	MatrixXcd Ixyz = MatrixXcd::Zero(2, 2);

//	std::cout << "Iy is " << endl << Iy << std::endl;

	MatrixXcd A(I2);
	MatrixXcd B(Ix);

	MatrixXcd C = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd IzSz = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd IxSx = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd IySy = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd IpE2 = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd E2Sp = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd IxE2 = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd E2Sx = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd IyE2 = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd E2Sy = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd IzE2 = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd E2Sz = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd Sy = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd HJz = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	MatrixXcd HJ = MatrixXcd::Zero(A.rows() * B.rows(), A.cols() * B.cols());
	kroneker(A,B,C);
cout << "kroneckerProduct is " << endl << C <<endl;

MatrixXcd I2I2 =  newKroneker(I2, I2);
	kroneker(I2,I2,I2I2);
	kroneker(Iz,Iz,IzSz);
	kroneker(Ix,Ix,IxSx);
	kroneker(Iy,Iy,IySy);
	kroneker(   Ix + Iy,I2,IpE2);
	kroneker(I2,Ix + Iy,E2Sp);
	kroneker(Ix ,I2,IxE2);
	kroneker(I2,Ix,E2Sx);
	kroneker(Iy ,I2,IyE2);
	kroneker(I2,Iy,E2Sy);
	kroneker(Iz ,I2,IzE2);
	kroneker(I2,Iz,E2Sz);
	const double J = 0.2;
	HJz = J / 4.0 * IzSz;
	HJ = J / 4.0 * (IzSz + IxSx + IySy);
	//Htot = HJ + 20.0 * IzE2 -200.0 * E2Sz;
	//Htot =  100.0 * E2Sz;
//	Htot = 10000.0 * IzE2 ;
MatrixXcd	Htot = HJ + 30.0 * IzE2 + 8.0 * E2Sz;
MatrixXcd rho0 = IxE2 + E2Sx;
MatrixXcd Det = (IpE2 + E2Sp);
cout << "IzSz is " << endl << IzSz <<endl;
cout << "IxSx is " << endl << IxSx <<endl;
cout << "IySy is " << endl << IySy <<endl;
cout << "HJz is " << endl << HJz <<endl;
cout << "HJ is " << endl << HJ <<endl;
cout << "Htot is " << endl << Htot <<endl;
cout << "Detector is " << endl << Det <<endl;


MatrixXcd covmat = Htot;
//Eigen::ComplexEigenSolver<Eigen::MatrixXcd> eigensolver;
Eigen::SelfAdjointEigenSolver<Eigen::MatrixXcd> eigensolver;


//Eigen::ComplexEigenSolver<Eigen::MatrixXcd> eigensolver;
    eigensolver.compute(covmat);
   
 Eigen::VectorXcd eigen_values = eigensolver.eigenvalues();
    Eigen::MatrixXcd eigen_vectors = eigensolver.eigenvectors();
    Eigen::MatrixXcd V_normalized_eigen_vectors = eigensolver.eigenvectors();
	for (int i = 0; i < V_normalized_eigen_vectors.rows(); i++) {
		Eigen::VectorXcd curVector = eigen_vectors.block(0 , i , eigen_vectors.rows(), 1);
		    V_normalized_eigen_vectors.block(0 , i , eigen_vectors.rows(), 1) = curVector / eigen_values(i).real();
		/*	 Eigen::MatrixXcd curVector = eigen_vectors.block(i , 0, 1, eigen_vectors.rows());
		    V_normalized_eigen_vectors.block(i , 0, 1, eigen_vectors.rows()) = curVector / eigen_values(i).real();*/
	}
	 Eigen::MatrixXcd inverse = V_normalized_eigen_vectors.inverse();
	 Eigen::MatrixXcd transpose = V_normalized_eigen_vectors.transpose();
	//inverse = eigen_vectors.transpose();
	  /*  Eigen::MatrixXcd diag3 = transpose;//.prod(V_normalized_eigen_vectors);
	     diag3.prod(covmat); //.prod(V_normalized_eigen_vectors);
	     diag3.prod(V_normalized_eigen_vectors);*/

    Eigen::MatrixXcd H_diag = transpose * covmat * V_normalized_eigen_vectors;
    Eigen::MatrixXcd s1 = H_diag.transpose() * rho0 * H_diag;
Eigen::MatrixXcd detected = (Det * s1);
cout << "Detected is " << endl << detected << endl;
cout << "Diagonal of detected is " << endl << detected.diagonal() << endl;
cout << "Trace of detected is " << endl << detected.trace() << endl;


   cout << " ================================================== " << endl;
   cout << "eigen_values of detected is " << endl << eigen_values << endl;
   cout << "eigen_values.real() of detected is " << endl << eigen_values.real() << endl;
   cout << "eigen_vectors of detected is " << endl << eigen_vectors << endl;
   cout << "V_normalized_eigen_vectors of detected is " << endl << V_normalized_eigen_vectors << endl;

   //cout << "V_normalized_eigen_vectors * transpose" << endl << V_normalized_eigen_vectors * transpose << endl;

   cout << "covmat " << endl << covmat << endl;
   cout << "H_diag " << endl << H_diag << endl;

	    cout << "1 of detected is " << endl << (rho0 * transpose)  << endl << endl;
	    cout << "2 of detected is " << endl << transpose * rho0  << endl << endl;

   cout << "1 of detected is " << endl << (V_normalized_eigen_vectors * rho0 * transpose)  << endl << endl;
	    cout << "2 of detected is " << endl << transpose * rho0 * V_normalized_eigen_vectors << endl << endl;
	    cout << "detected is " << endl <<  covmat  << endl << endl;
	    cout << "s1 is " << endl <<  s1  << endl << endl;


	    cout << "IpE2  " << endl << (IpE2)  << endl << endl;
	    cout << "IxE2  " << endl << (IxE2 )  << endl << endl;
	    cout << "IaE2  " << endl << (IxE2 +complex_i * IyE2)  << endl << endl;
		cout << "IaE2 p " << endl << (  E2Sz ).diagonal().real()  << endl << endl;
		
		Eigen::VectorXd  tts2 = eigen_values.real();

 cout << "eigen_values p " << endl << eigen_values.real() << endl << endl;

 cout << "dot11   " << endl << tts2(2) - tts2(0) << endl << endl;//-1  0  1  0
 cout << "dot11   " << endl << tts2(3) - tts2(1) << endl << endl;// 0 -1  0  1
 
 cout << "dot22   " << endl << tts2(1) - tts2(0) << endl << endl;//-1  1  0  0
 cout << "dot22   " << endl << tts2(3) - tts2(2) << endl << endl;// 0  0 -1  1















{










MatrixXcd IzE2E2 =  newKroneker(Iz, newKroneker(I2, I2));
MatrixXcd E2SzE2 =  newKroneker(I2, newKroneker(Iz, I2));
MatrixXcd E2E2Mz =  newKroneker(I2, newKroneker(I2, Iz));
MatrixXcd IxE2E2 =  newKroneker(Ix, newKroneker(I2, I2));
MatrixXcd E2SxE2 =  newKroneker(I2, newKroneker(Ix, I2));
MatrixXcd E2E2Mx =  newKroneker(I2, newKroneker(I2, Ix));
MatrixXcd IzSzE2 =  newKroneker(IzSz, I2);
MatrixXcd E2IzSz =  newKroneker(I2, IzSz);
MatrixXcd IzE2Mz =  newKroneker(Iz, newKroneker(I2, Iz));

MatrixXcd IxE2Mx =  newKroneker(Ix, newKroneker(I2, Ix));
MatrixXcd IyE2My =  newKroneker(Iy, newKroneker(I2, Iy));
MatrixXcd E2IxSx =  newKroneker(I2, newKroneker(Ix, Ix));
MatrixXcd E2IySy =  newKroneker(I2, newKroneker(Iy, Iy));

MatrixXcd IxSxE2 =  newKroneker(IxSx, I2);
MatrixXcd IySyE2 =  newKroneker(IySy, I2);

	const double JAX = 2;
	const double JAM = 0.2;
	const double JMX = 0.02;
	HJz = JAX / 4.0 * IzSzE2 + JAM / 4.0 * IzE2Mz + JMX / 4.0 * E2IzSz;
	HJ = JAX / 4.0 * (IzSzE2 + IxSxE2 + IySyE2) + JAM / 4.0 * (IzE2Mz + IxE2Mx + IyE2My) + JMX / 4.0 * (E2IzSz + E2IxSx + E2IySy) ;
	//Htot = HJ + 20.0 * IzE2 -200.0 * E2Sz;
	//Htot =  100.0 * E2Sz;
//	Htot = 10000.0 * IzE2 ;
MatrixXcd	Htot = HJz + 30.0 * IzE2E2 + 100000.0 * E2SzE2 - 1000 * E2E2Mz;
MatrixXcd rho0 = IxE2E2 + E2SxE2 + E2E2Mx;

cout << "Htot is " << endl << Htot <<endl;
cout << "Detector is " << endl << Det <<endl;


MatrixXcd covmat = Htot;
//Eigen::ComplexEigenSolver<Eigen::MatrixXcd> eigensolver;
Eigen::SelfAdjointEigenSolver<Eigen::MatrixXcd> eigensolver;


//Eigen::ComplexEigenSolver<Eigen::MatrixXcd> eigensolver;
    eigensolver.compute(covmat);
   
 Eigen::VectorXcd eigen_values = eigensolver.eigenvalues();
    Eigen::MatrixXcd eigen_vectors = eigensolver.eigenvectors();
    Eigen::MatrixXcd V_normalized_eigen_vectors = eigensolver.eigenvectors();
	for (int i = 0; i < V_normalized_eigen_vectors.rows(); i++) {
		Eigen::VectorXcd curVector = eigen_vectors.block(0 , i , eigen_vectors.rows(), 1);
		    V_normalized_eigen_vectors.block(0 , i , eigen_vectors.rows(), 1) = curVector / eigen_values(i).real();
		/*	 Eigen::MatrixXcd curVector = eigen_vectors.block(i , 0, 1, eigen_vectors.rows());
		    V_normalized_eigen_vectors.block(i , 0, 1, eigen_vectors.rows()) = curVector / eigen_values(i).real();*/
	}
	 Eigen::MatrixXcd inverse = V_normalized_eigen_vectors.inverse();
	 Eigen::MatrixXcd transpose = V_normalized_eigen_vectors.transpose();
	//inverse = eigen_vectors.transpose();
	  /*  Eigen::MatrixXcd diag3 = transpose;//.prod(V_normalized_eigen_vectors);
	     diag3.prod(covmat); //.prod(V_normalized_eigen_vectors);
	     diag3.prod(V_normalized_eigen_vectors);*/

    Eigen::MatrixXcd H_diag = transpose * covmat * V_normalized_eigen_vectors;
    Eigen::MatrixXcd s1 = H_diag.transpose() * rho0 * H_diag;


   cout << " ================================================== " << endl;
   cout << "eigen_values.real() of detected is " << endl << eigen_values.real() << endl;
   cout << "V_normalized_eigen_vectors of detected is " << endl << V_normalized_eigen_vectors << endl;

		Eigen::VectorXd  tts2 = eigen_values.real();

 cout << "eigen_values p " << endl << eigen_values.real() << endl << endl;

 cout << "dot11   " << endl << tts2(1) - tts2(0)  << endl << endl;//-1  0  1  0 -1  0  1  0
 cout << "dot11   " << endl << tts2(4+3) - tts2(4+2) << endl << endl;//-1  0  1  0 -1  0  1  0
 cout << "dot11   " << endl << tts2(3) - tts2(2)  << endl << endl;// 0 -1  0  1  0 -1  0  1
 cout << "dot11   " << endl << tts2(4+1) - tts2(4+0) << endl << endl;// 0 -1  0  1  0 -1  0  1

 cout << "dot22   " << endl << tts2(2) - tts2(1)  << endl << endl;//-1  0  1  0 -1  0  1  0
 cout << "dot22   " << endl << tts2(4+2) - tts2(4+1) << endl << endl;//-1  0  1  0 -1  0  1  0
 cout << "dot22   " << endl << tts2(3) - tts2(0)  << endl << endl;// 0 -1  0  1  0 -1  0  1
 cout << "dot22   " << endl << tts2(4+3) - tts2(4+0) << endl << endl;// 0 -1  0  1  0 -1  0  1

 cout << "dot22   " << endl << tts2(1) - tts2(0) + tts2(4+1) - tts2(4+0) << endl << endl;//-1  1  0  0
 cout << "dot22   " << endl << tts2(3) - tts2(2) + tts2(4+3) - tts2(4+2) << endl << endl;// 0  0 -1  1
 

	for (int i = 0; i < V_normalized_eigen_vectors.rows(); i++) { 
	for (int i2 = 0; i2 < V_normalized_eigen_vectors.rows(); i2++) {
		cout << "  " << tts2(i) - tts2(i2) ;
	}
			cout << endl;

	}


}

// for 1 spin no coupling
// -1  1
// for 3 spins 
// -1  0  1  0  0  0  0  0


{/*
	Matrix2f A;
   A << 2*cos(30/180.0*3.1415), 2*sin(30/180.0*3.1415), -3*sin(30/180.0*3.1415), 3*cos(30/180.0*3.1415);
         cout << "A is " << endl << A << endl;

   Eigen::SelfAdjointEigenSolver<Eigen::Matrix2f> eigensolver2(A);
    //eigensolver2.compute(A);

      cout << "eigenvalues " << endl << eigensolver2.eigenvalues().real() << endl;
      cout << "eigenvectors " << endl << eigensolver2.eigenvectors().real() << endl;
	 cout << "eigenvalues " << endl << eigensolver2.eigenvalues() << endl;
      cout << "eigenvectors " << endl << eigensolver2.eigenvectors() << endl;
      cout << "vect of detected is " << endl << (A * eigensolver2.eigenvectors()) << endl;
      cout << "vect of detected is " << endl << ( eigensolver2.eigenvectors().transpose() * A) << endl;
	   cout << "vect of detected is " << endl << (A * eigensolver2.eigenvectors().inverse() ) << endl;
      cout << "vect of detected is " << endl << ( eigensolver2.eigenvectors().inverse() * A) << endl;
	  */
}
}



}